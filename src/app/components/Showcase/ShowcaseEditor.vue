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
		type ProjectType,
		PROJECT_LABELS,
		showcaseFieldsSchema,
		type ShowcaseItem,
		type ShowcaseContext,
		type ShowcaseFields,
		type ProjectPreview,
	} from "#shared/types/Showcase";
	import type { useShowcaseStore } from "~/stores/useShowcaseStore";
	import ImageEditor from "~/components/Images/ImageEditor.vue";
	const props = defineProps<{
		context: ShowcaseContext;
		item: ShowcaseItem | null;
		store: ReturnType<typeof useShowcaseStore>;
	}>();
	const emit = defineEmits<{ saved: []; cancel: [] }>();
	type ImageChange = { action: "upload"; png: string } | { action: "delete" };
	type ImageEditorHandle = { importFile: (file: File) => Promise<boolean>; close: () => void };
	const PROJECT_OPTIONS: { label: string; value: ProjectType }[] = PROJECT_TYPES.map((value: ProjectType): { label: string; value: ProjectType } => ({ label: PROJECT_LABELS[value], value }));
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
	const choosingProject: Ref<boolean> = ref(!props.item);
	const projects: Ref<ProjectPreview[]> = ref([]);
	const offset: Ref<number> = ref(0);
	const more: Ref<boolean> = ref(false);
	const error: Ref<string> = ref("");
	const busy: Ref<boolean> = ref(false);
	const validated: Ref<boolean> = ref(false);
	const removeImage: Ref<boolean> = ref(false);
	const selected: Ref<boolean> = ref(Boolean(props.item));
	const imageEditor: Ref<ImageEditorHandle | null> = ref(null);
	const thumbnailPng: Ref<string | null> = ref(null);
	const imageBusy: Ref<boolean> = ref(false);
	const thumbnailUrl: ComputedRef<string | null> = computed((): string | null => thumbnailPng.value ? `data:image/png;base64,${thumbnailPng.value}` : removeImage.value ? null : props.item?.thumbnailUrl ?? null);
	const needsProject: ComputedRef<boolean> = computed(
		(): boolean =>
			fields.projectType === "scratch" || fields.projectType === "itch",
	);
	const canSave: ComputedRef<boolean> = computed((): boolean => showcaseFieldsSchema.safeParse(fields).success && (!needsProject.value || selected.value));
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
		choosingProject.value = true;
		imageEditor.value?.close();
		thumbnailPng.value = null;
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
		choosingProject.value = false;
		imageEditor.value?.close();
		thumbnailPng.value = null;
		removeImage.value = true;
		error.value = "";
		if (project.imageUrl) {
			busy.value = true;
			try {
				const file: File = await props.store.image.mutateAsync(
					project.imageUrl,
				);
				if (current !== generation) return;
				await nextTick();
				const imported: boolean = await imageEditor.value?.importFile(file) ?? false;
				if (current !== generation) return;
				if (!imported)
					error.value =
						"Project details loaded. Upload a thumbnail because the imported image could not be decoded.";
			} catch (failure: unknown) {
				if (current === generation) error.value = `Project details loaded. Image could not be imported: ${message(failure)}`;
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
	/** Keep thumbnail edits local until the whole showcase entry is saved. */
	async function changeImage(action: ImageChange): Promise<void> {
		thumbnailPng.value = action.action === "upload" ? action.png : null;
		removeImage.value = action.action === "delete";
	}
	/** Save the final reviewed entry and its processed image through the TanStack mutation. */
	async function save(): Promise<void> {
		if (busy.value || imageBusy.value) return;
		error.value = "";
		if (!canSave.value) {
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
				png: thumbnailPng.value,
				removeImage: removeImage.value,
			});
			imageEditor.value?.close();
			thumbnailPng.value = null;
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
				choosingProject.value = true;
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
			choosingProject.value,
		],
		([projectType, username, pickerVisible]): void => {
			if (projectType === "scratch" && username && pickerVisible)
				void discover();
		},
		{ immediate: true, flush: "post" },
	);
</script>
<template>
	<UForm :schema="showcaseFieldsSchema" :state="fields" class="ShowcaseEditor" @submit="save">
		<h2>{{ item ? "Edit showcase entry" : "Add to your showcase" }}</h2>
		<UFormField label="Project type" name="projectType">
			<USelect v-model="fields.projectType" :items="PROJECT_OPTIONS" class="FormControl" :disabled="busy || imageBusy" @update:modelValue="changeProjectType" />
		</UFormField>
		<section v-if="needsProject" class="ProjectSetup">
			<div v-if="selected && !choosingProject" class="SelectedProject">
				<p>Selected: <strong>{{ fields.title }}</strong></p>
				<UButton type="button" variant="outline" :disabled="busy || imageBusy" @click="choosingProject = true">Change project</UButton>
			</div>
			<template v-else>
				<template v-if="fields.projectType === 'scratch'">
					<p v-if="!context.scratchName">Add your Scratch username to your <a :href="context.profileUrl" target="_blank" rel="noopener">club profile ↗</a> to choose your shared projects.</p>
					<template v-else>
						<p>Shared projects from {{ context.scratchName }}.</p>
						<UButton type="button" variant="outline" :loading="busy" @click="discover()">Refresh projects</UButton>
						<p class="FormHint">Project missing? Share it publicly on Scratch, then refresh this list.</p>
					</template>
				</template>
				<template v-else>
					<UFormField label="Public itch.io project URL">
						<UInput v-model="fields.url" type="url" placeholder="https://your-name.itch.io/your-project" class="FormControl" :disabled="busy" />
					</UFormField>
					<UButton type="button" variant="outline" :disabled="!fields.url" :loading="busy" @click="discover()">Find project</UButton>
				</template>
				<div v-if="projects.length" class="ProjectOptions">
					<div v-for="project in projects" :key="project.sourceProjectId" class="ProjectOption">
						<UButton type="button" variant="outline" :disabled="busy || imageBusy" :aria-pressed="fields.sourceProjectId === project.sourceProjectId" @click="selectProject(project)">{{ project.title }}<span v-if="fields.sourceProjectId === project.sourceProjectId"> ✓</span></UButton>
						<a :href="project.url" target="_blank" rel="noopener noreferrer" :aria-label="`Open ${project.title} in a new tab`">Open project ↗</a>
					</div>
					<UButton v-if="more" type="button" variant="outline" :loading="busy" @click="discover(true)">Load more</UButton>
				</div>
				<p v-else-if="!busy && store.discover.isSuccess.value && fields.projectType === 'scratch'">No shared projects found. Share your project on Scratch, then refresh.</p>
				<UButton v-if="selected" type="button" variant="ghost" :disabled="busy" @click="choosingProject = false">Keep selected project</UButton>
			</template>
		</section>
		<section v-if="fields.projectType === 'github_profile'" class="ProjectSetup">
			<p v-if="!context.githubLogin">Add your GitHub username to your <a :href="context.profileUrl" target="_blank" rel="noopener">club profile ↗</a> first.</p>
			<template v-else>
				<p>GitHub account: {{ context.githubLogin }}</p>
				<UButton type="button" variant="outline" :loading="busy" @click="validate">{{ validated ? "Check again" : "Validate public page" }}</UButton>
				<p v-if="validated" role="status">Your GitHub Pages site is ready to share.</p>
			</template>
			<p class="FormHint">Publish your user site before making this entry visible. <a href="https://docs.github.com/en/pages/quickstart" target="_blank" rel="noopener">GitHub Pages setup ↗</a></p>
		</section>
		<UFormField label="Title" name="title"><UInput v-model="fields.title" :maxlength="200" class="FormControl" :disabled="busy" /></UFormField>
		<UFormField label="Description" name="description"><UTextarea v-model="fields.description" :rows="3" :maxlength="10000" autoresize class="FormControl" :disabled="busy" /></UFormField>
		<UFormField v-if="fields.projectType === 'website'" label="Project URL" name="url"><UInput v-model="fields.url" type="url" class="FormControl" :disabled="busy" /></UFormField>
		<UFormField label="Thumbnail">
			<ImageEditor ref="imageEditor" class="ThumbnailEditor" :identity="`${fields.projectType}:${fields.sourceProjectId ?? ''}`" :populated="!!thumbnailUrl" :saving="false" :locked="busy" :notify="false" :change="changeImage" @busy="imageBusy = $event">
				<img v-if="thumbnailUrl" :src="thumbnailUrl" alt="Showcase thumbnail" class="Thumbnail" />
				<UIcon v-else name="i-lucide-image-plus" class="EmptyThumbnail" />
			</ImageEditor>
		</UFormField>
		<UFormField label="Showcase date" name="showcaseDate"><UInput v-model="fields.showcaseDate" type="date" :disabled="busy" /></UFormField>
		<USwitch v-model="fields.isVisible" label="Visible on the public showcase" :disabled="busy || (fields.projectType === 'github_profile' && !validated && !fields.isVisible)" />
		<p v-if="fields.projectType === 'github_profile' && !validated && !fields.isVisible" class="FormHint">Validate your GitHub Pages site to enable visibility. You can save this entry hidden.</p>
		<UAlert v-if="error" color="error" :title="error" />
		<div class="EditorActions">
			<UButton type="submit" :loading="busy" :disabled="!canSave || imageBusy">Save entry</UButton>
			<UButton type="button" variant="outline" :disabled="busy || imageBusy" @click="emit('cancel')">Cancel</UButton>
		</div>
	</UForm>
</template>

<style scoped lang="scss">
	.ShowcaseEditor { display: grid; align-content: start; align-self: start; gap: calc(var(--spacing) * 4); width: 100%; max-width: 42rem; min-width: 0; }
	h2 { font-size: var(--text-lg); font-weight: 600; }
	.ProjectSetup { display: grid; justify-items: start; gap: calc(var(--spacing) * 3); min-width: 0; }
	.FormControl { width: 100%; }
	.FormHint { color: var(--ui-text-muted); font-size: var(--text-sm); }
	.ProjectOptions { display: grid; gap: calc(var(--spacing) * 2); width: 100%; max-height: 20rem; overflow-y: auto; padding: calc(var(--spacing) * 1); }
	.ProjectOption, .SelectedProject, .EditorActions { display: flex; align-items: center; flex-wrap: wrap; gap: calc(var(--spacing) * 3); }
	.ProjectOption > :first-child { flex: 1; min-width: 0; text-align: start; white-space: normal; overflow-wrap: anywhere; }
	.ProjectOption a { flex-shrink: 0; }
	.ProjectSetup a { text-decoration: underline; }
	.ThumbnailEditor { width: min(100%, 12rem); }
	.Thumbnail { width: 100%; height: 100%; aspect-ratio: 1; object-fit: contain; }
	.EmptyThumbnail { width: 2rem; height: 2rem; color: var(--ui-text-muted); }
</style>
