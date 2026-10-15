<script setup lang="ts">
	import {
		computed,
		reactive,
		ref,
		watch,
		nextTick,
		type Ref,
		type ComputedRef,
	} from "vue";
	import { Temporal } from "temporal-polyfill";
	import {
		PROJECT_TYPES,
		PROJECT_LABELS,
		showcaseFieldsSchema,
		type ShowcaseItem,
		type ShowcaseContext,
		type ShowcaseFields,
		type ProjectPreview,
	} from "#shared/types/Showcase";
	import type { useShowcaseStore } from "~/stores/useShowcaseStore";
	import { useImageSource } from "~/composables/useImageSource";
	import ImageCropper from "~/components/Images/ImageCropper.vue";
	const props = defineProps<{
		context: ShowcaseContext;
		item: ShowcaseItem | null;
		store: ReturnType<typeof useShowcaseStore>;
	}>();
	const emit = defineEmits<{ saved: []; cancel: [] }>();
	const fields: ShowcaseFields = reactive(
		props.item
			? {
					title: props.item.title,
					description: props.item.description,
					projectType: props.item.projectType,
					url: props.item.url,
					showcaseDate: props.item.showcaseDate,
					isVisible: props.item.isVisible,
					sourceProjectId: props.item.sourceProjectId,
				}
			: {
					title: "",
					description: "",
					projectType: "scratch",
					url: "",
					showcaseDate: Temporal.Now.plainDateISO("Europe/Dublin").toString(),
					isVisible: true,
					sourceProjectId: null,
				},
	);
	const step: Ref<number> = ref(props.item ? 2 : 0);
	const projects: Ref<ProjectPreview[]> = ref([]);
	const offset: Ref<number> = ref(0);
	const more: Ref<boolean> = ref(false);
	const error: Ref<string> = ref("");
	const busy: Ref<boolean> = ref(false);
	const validated: Ref<boolean> = ref(false);
	const removeImage: Ref<boolean> = ref(false);
	const selected: Ref<boolean> = ref(Boolean(props.item));
	const source: ReturnType<typeof useImageSource> = useImageSource();
	const cropper: Ref<{ getPng: () => string } | null> = ref(null);
	const needsProject: ComputedRef<boolean> = computed(
		(): boolean =>
			fields.projectType === "scratch" || fields.projectType === "itch",
	);
	const canContinue: ComputedRef<boolean> = computed((): boolean =>
		step.value === 0
			? true
			: step.value === 1
				? !needsProject.value || selected.value
				: showcaseFieldsSchema.safeParse(fields).success,
	);
	let generation: number = 0;
	/** Reset source-specific state when choosing another project type. */
	function changeProjectType(): void {
		generation++;
		fields.url = "";
		fields.sourceProjectId = null;
		fields.title = "";
		fields.description = "";
		fields.isVisible = fields.projectType !== "github_profile";
		validated.value = false;
		projects.value = [];
		selected.value = false;
		source.close();
		removeImage.value = true;
		error.value = "";
	}
	/** Display actionable server failures while keeping the draft. */
	function message(failure: unknown): string {
		return (
			(failure as { data?: { statusMessage?: string }; message?: string }).data
				?.statusMessage ??
			(failure as Error).message ??
			"Unable to complete this action. Retry."
		);
	}
	/** Retrieve further shared projects or resolve an itch.io project URL. */
	async function discover(append: boolean = false): Promise<void> {
		busy.value = true;
		error.value = "";
		const current: number = ++generation;
		try {
			const next: ProjectPreview[] = await props.store.discover.mutateAsync({
				projectType: fields.projectType,
				url: fields.url,
				offset: append ? offset.value : 0,
			});
			if (current !== generation) return;
			projects.value = append ? [...projects.value, ...next] : next;
			offset.value = (append ? offset.value : 0) + next.length;
			more.value = fields.projectType === "scratch" && next.length === 40;
		} catch (failure: unknown) {
			if (current === generation) error.value = message(failure);
		} finally {
			if (current === generation) busy.value = false;
		}
	}
	/** Apply imported details only after the member confirms replacing an existing selection. */
	async function selectProject(project: ProjectPreview): Promise<void> {
		if (
			selected.value &&
			!window.confirm(
				"Replace the current title, description and image with this project’s details?",
			)
		)
			return;
		const current: number = ++generation;
		fields.title = project.title;
		fields.description = project.description;
		fields.url = project.url;
		fields.sourceProjectId = project.sourceProjectId;
		selected.value = true;
		source.close();
		removeImage.value = true;
		error.value = "";
		if (project.imageUrl) {
			busy.value = true;
			try {
				const file: File = await props.store.image.mutateAsync(
					project.imageUrl,
				);
				if (current !== generation) return;
				const decoded: HTMLImageElement | null = await source.choose(file);
				if (!decoded)
					error.value =
						"Project details loaded. Upload a thumbnail because the imported image could not be decoded.";
				await nextTick();
			} catch (failure: unknown) {
				error.value = `Project details loaded. Image could not be imported: ${message(failure)}`;
			} finally {
				if (current === generation) busy.value = false;
			}
		}
	}
	/** Validate the owning member's GitHub Pages site before enabling publication. */
	async function validate(): Promise<void> {
		busy.value = true;
		error.value = "";
		try {
			const result: { url: string } = await props.store.validate.mutateAsync();
			fields.url = result.url;
			validated.value = true;
		} catch (failure: unknown) {
			validated.value = false;
			fields.isVisible = false;
			error.value = message(failure);
		} finally {
			busy.value = false;
		}
	}
	/** Process a local thumbnail using the existing image pipeline. */
	async function choose(event: Event): Promise<void> {
		const file: File | undefined = (event.target as HTMLInputElement)
			.files?.[0];
		if (file) {
			await source.choose(file);
			if (source.error.value)
				error.value = "Choose a PNG, JPEG or WebP image up to 8 MB.";
			else removeImage.value = false;
		}
	}
	/** Save the final reviewed entry and its processed image through the TanStack mutation. */
	async function save(): Promise<void> {
		error.value = "";
		if (!showcaseFieldsSchema.safeParse(fields).success) {
			error.value =
				"Complete the title, description, public URL and valid date.";
			return;
		}
		busy.value = true;
		try {
			await props.store.save.mutateAsync({
				id: props.item?.id ?? null,
				expectedUpdatedAt: props.item?.updatedAt ?? null,
				fields: { ...fields },
				png: cropper.value?.getPng() ?? null,
				removeImage: removeImage.value,
			});
			source.close();
			emit("saved");
		} catch (failure: unknown) {
			error.value = message(failure);
		} finally {
			busy.value = false;
		}
	}
	watch(
		(): string | null => props.context.githubLogin,
		(): void => {
			validated.value = false;
			if (fields.projectType === "github_profile") fields.isVisible = false;
		},
	);
	watch(
		(): string | null => props.context.scratchName,
		(): void => {
			if (fields.projectType === "scratch") {
				selected.value = false;
				projects.value = [];
				error.value = "Scratch account changed. Select a project.";
			}
		},
	);
	// Load Scratch projects when the picker opens or the linked account changes.
	watch(
		(): readonly [string, string | null, boolean] => [
			fields.projectType,
			props.context.scratchName,
			Boolean(props.item) || step.value === 1,
		],
		([projectType, username, pickerVisible]): void => {
			if (projectType === "scratch" && username && pickerVisible)
				void discover();
		},
		{ immediate: true, flush: "post" },
	);
</script>
<template>
	<form class="ShowcaseEditor" @submit.prevent="save">
		<header>
			<h2>{{ item ? "Edit showcase entry" : "Add to your showcase" }}</h2>
			<p v-if="!item">
				Step {{ step + 1 }} of 4 ·
				{{
					[
						"Choose project type",
						"Select your project",
						"Review project details",
						"Date and visibility",
					][step]
				}}
			</p>
		</header>
		<fieldset v-show="step === 0 || !!item" :disabled="busy">
			<legend>Project type</legend>
			<select
				v-model="fields.projectType"
				aria-label="Project type"
				@change="changeProjectType"
			>
				<option
					v-for="projectType in PROJECT_TYPES"
					:key="projectType"
					:value="projectType"
				>
					{{ PROJECT_LABELS[projectType] }}
				</option>
			</select>
		</fieldset>
		<section v-show="step === 1 || !!item" class="ProjectSetup">
			<template v-if="fields.projectType === 'scratch'"
				><p v-if="!context.scratchName">
					Add your Scratch username to your club profile to choose your shared
					projects.
					<a :href="context.profileUrl" target="_blank" rel="noopener"
						>Open profile ↗</a
					>
				</p>
				<template v-else
					><p>Choose a shared project from {{ context.scratchName }}.</p>
					<button type="button" :disabled="busy" @click="discover()">
						Refresh projects
					</button>
					<p>
						Project missing? Share it publicly on Scratch, then refresh this
						list.
					</p></template
				></template
			>
			<template v-if="fields.projectType === 'itch'"
				><label
					>Public itch.io project URL<input
						v-model="fields.url"
						type="url"
						placeholder="https://your-name.itch.io/your-project" /></label
				><button
					type="button"
					:disabled="busy || !fields.url"
					@click="discover()"
				>
					Find project
				</button>
				<p>
					Publish your itch.io project, then paste its public page address.
				</p></template
			>
			<template v-if="fields.projectType === 'github_profile'"
				><p v-if="!context.githubLogin">
					Add your GitHub username to your club profile first.
					<a :href="context.profileUrl" target="_blank" rel="noopener"
						>Open profile ↗</a
					>
				</p>
				<template v-else
					><p>GitHub account: {{ context.githubLogin }}</p>
					<button type="button" :disabled="busy" @click="validate">
						{{ validated ? "Check again" : "Validate public page" }}
					</button>
					<p v-if="validated" role="status">
						Your GitHub Pages site is ready to share.
					</p></template
				>
				<p>
					Create and publish your user site before making this entry visible.
					<a
						href="https://docs.github.com/en/pages/quickstart"
						target="_blank"
						rel="noopener"
						>GitHub Pages setup instructions ↗</a
					>
				</p></template
			>
			<p v-if="fields.projectType === 'website'">
				Enter the public address of your website in the project details.
			</p>
			<div v-if="projects.length" class="ProjectOptions">
				<div
					v-for="project in projects"
					:key="project.sourceProjectId"
					class="ProjectOption"
				>
					<button
						type="button"
						:disabled="busy"
						@click="selectProject(project)"
					>
						{{ project.title
						}}<span v-if="fields.sourceProjectId === project.sourceProjectId">
							✓</span
						>
					</button>
					<a
						:href="project.url"
						target="_blank"
						rel="noopener noreferrer"
						:aria-label="`Open ${project.title} in a new tab`"
						>Open project ↗</a
					>
				</div>
				<button
					v-if="more"
					type="button"
					:disabled="busy"
					@click="discover(true)"
				>
					Load more
				</button>
			</div>
			<p
				v-else-if="
					store.discover.isSuccess.value && fields.projectType === 'scratch'
				"
			>
				No shared projects found. Share your project on Scratch, then refresh.
			</p>
			<p v-if="selected && needsProject">
				Project selected. Review its title, description and image below.
			</p>
		</section>
		<fieldset v-show="step === 2 || !!item" :disabled="busy">
			<legend>Project details</legend>
			<label>Title<input v-model="fields.title" maxlength="200" /></label
			><label
				>Description<textarea
					v-model="fields.description"
					rows="5"
					maxlength="10000"
				/></label
			><label
				>Project URL<input
					v-model="fields.url"
					type="url"
					:readonly="fields.projectType === 'github_profile'" /></label
			><label
				>Thumbnail<input
					type="file"
					accept="image/png,image/jpeg,image/webp"
					@change="choose" /></label
			><ImageCropper
				v-if="source.image.value"
				ref="cropper"
				:image="source.image.value"
				:round="false"
				:disabled="busy"
			/><img
				v-else-if="item?.thumbnailUrl && !removeImage"
				:src="item.thumbnailUrl"
				alt="Current thumbnail"
				class="CurrentThumbnail"
			/><button
				type="button"
				@click="
					source.close();
					removeImage = true;
				"
			>
				Remove thumbnail
			</button>
		</fieldset>
		<fieldset v-show="step === 3 || !!item" :disabled="busy">
			<legend>Date and visibility</legend>
			<label
				>Showcase date<input v-model="fields.showcaseDate" type="date" /></label
			><label class="VisibleToggle"
				><input
					v-model="fields.isVisible"
					type="checkbox"
					role="switch"
					:disabled="
						fields.projectType === 'github_profile' &&
						!validated &&
						!fields.isVisible
					"
				/>Visible on the public showcase</label
			>
			<p
				v-if="
					fields.projectType === 'github_profile' &&
					!validated &&
					!fields.isVisible
				"
			>
				Validate your GitHub Pages site to enable visibility. You can save this
				entry hidden.
			</p>
			<p v-if="!item">
				<strong>{{ fields.title }}</strong> ·
				{{ PROJECT_LABELS[fields.projectType] }}
			</p>
		</fieldset>
		<p v-if="error" role="alert">{{ error }}</p>
		<p v-if="busy || source.loading.value" role="status">Working…</p>
		<div class="EditorActions">
			<button
				v-if="!item && step > 0"
				type="button"
				:disabled="busy"
				@click="step--"
			>
				Back</button
			><button
				v-if="!item && step < 3"
				type="button"
				:disabled="busy || !canContinue"
				@click="step++"
			>
				Next</button
			><button v-else type="submit" :disabled="busy || source.loading.value">
				Save entry</button
			><button type="button" :disabled="busy" @click="emit('cancel')">
				Cancel
			</button>
		</div>
	</form>
</template>
<style scoped lang="scss">
	.ShowcaseEditor,
	.ProjectSetup,
	fieldset,
	label {
		display: grid;
		gap: 1rem;
	}
	fieldset {
		border: 1px solid var(--ui-border);
		padding: 1rem;
		border-radius: 0.5rem;
		min-width: 0;
	}
	input,
	select,
	textarea {
		width: 100%;
		min-width: 0;
		border: 1px solid var(--ui-border);
		border-radius: 0.4rem;
		padding: 0.6rem;
		background: var(--ui-bg);
		color: var(--ui-text);
	}
	button {
		padding: 0.6rem 1rem;
		border: 1px solid var(--ui-border);
		border-radius: 0.5rem;
		cursor: pointer;
		justify-self: start;
	}
	button:disabled {
		opacity: 0.5;
		cursor: default;
	}
	.EditorActions,
	.VisibleToggle {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
	}
	.VisibleToggle input {
		width: auto;
	}
	.ProjectOptions {
		display: grid;
		gap: 0.5rem;
	}
	.ProjectOption {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
	}
	.ProjectOption button {
		flex: 1;
		min-width: 0;
		text-align: left;
		overflow-wrap: anywhere;
	}
	.ProjectOption a {
		flex-shrink: 0;
		text-decoration: underline;
	}
	.CurrentThumbnail {
		width: min(100%, 20rem);
		aspect-ratio: 1;
		object-fit: contain;
	}
</style>
