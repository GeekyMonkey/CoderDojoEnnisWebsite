<script setup lang="ts">
	import {
		VEX_RESOURCE_CATEGORIES,
		VEX_RESOURCE_TYPES,
		type VexResourceCategory,
		type VexResourceModel,
		type VexResourceSaveModel,
		type VexResourceType,
	} from "#shared/types/models/VexResourceModel";
	import { useVexStore } from "~/stores/useVexStore";

	const props = defineProps<{
		resource: VexResourceModel | null;
		defaultCategory?: VexResourceCategory;
	}>();

	const open = defineModel<boolean>("open", { default: false });

	type ResourceForm = {
		title: string;
		description: string;
		url: string;
		category: VexResourceCategory;
		resourceType: VexResourceType;
		seasonId: string;
		sortOrder: number;
		isActive: boolean;
	};

	type SelectItem = {
		label: string;
		value: string;
	};

	const GENERAL_SEASON: string = "general";

	const { t } = useI18n();
	const toast = useToast();
	const { Seasons, saveResource, deleteResource } = useVexStore();

	const form = ref<ResourceForm>(blankForm());
	const isSaving = ref<boolean>(false);

	const categoryItems = computed<SelectItem[]>(() =>
		VEX_RESOURCE_CATEGORIES.map((c) => ({
			label: t(`vex.resources.categories.${c}.label`),
			value: c,
		})),
	);

	const typeItems = computed<SelectItem[]>(() =>
		VEX_RESOURCE_TYPES.map((r) => ({
			label: t(`vex.resources.types.${r}`),
			value: r,
		})),
	);

	const seasonItems = computed<SelectItem[]>(() => [
		{ label: t("vex.resources.fields.seasonGeneral"), value: GENERAL_SEASON },
		...Seasons.value.map((s) => ({
			label: `${s.seasonLabel} – ${s.competitionName}`,
			value: s.id,
		})),
	]);

	const canSave = computed<boolean>(
		() =>
			!isSaving.value &&
			form.value.title.trim().length > 0 &&
			/^https?:\/\/\S+$/i.test(form.value.url.trim()),
	);

	/**
	 * Empty form values
	 */
	function blankForm(): ResourceForm {
		return {
			title: "",
			description: "",
			url: "",
			category: props.defaultCategory ?? "competition",
			resourceType: "website",
			seasonId: GENERAL_SEASON,
			sortOrder: 100,
			isActive: true,
		};
	}

	/**
	 * Load the form from the resource being edited
	 */
	function resetForm(): void {
		form.value = props.resource
			? {
					title: props.resource.title,
					description: props.resource.description ?? "",
					url: props.resource.url,
					category: props.resource.category,
					resourceType: props.resource.resourceType,
					seasonId: props.resource.seasonId ?? GENERAL_SEASON,
					sortOrder: props.resource.sortOrder,
					isActive: props.resource.isActive,
				}
			: blankForm();
	}

	/**
	 * Save the resource and close
	 */
	async function save(): Promise<void> {
		if (!canSave.value) {
			return;
		}
		isSaving.value = true;
		try {
			const payload: VexResourceSaveModel = {
				id: props.resource?.id,
				title: form.value.title.trim(),
				description: form.value.description.trim() || null,
				url: form.value.url.trim(),
				category: form.value.category,
				resourceType: form.value.resourceType,
				seasonId:
					form.value.seasonId === GENERAL_SEASON ? null : form.value.seasonId,
				sortOrder: Number(form.value.sortOrder) || 0,
				isActive: form.value.isActive,
			};
			await saveResource(payload);
			open.value = false;
		} catch (error) {
			toast.add({
				title: t("vex.common.saveError", { error: ErrorToString(error) }),
				color: "error",
			});
		} finally {
			isSaving.value = false;
		}
	}

	/**
	 * Remove the resource and close
	 */
	async function remove(): Promise<void> {
		if (!props.resource) {
			return;
		}
		isSaving.value = true;
		try {
			await deleteResource(props.resource.id);
			open.value = false;
		} catch (error) {
			toast.add({
				title: t("vex.common.saveError", { error: ErrorToString(error) }),
				color: "error",
			});
		} finally {
			isSaving.value = false;
		}
	}

	/**
	 * Close the dialog without saving
	 */
	function close(): void {
		open.value = false;
	}

	watch(open, (isOpen: boolean) => {
		if (isOpen) {
			resetForm();
		}
	});
</script>

<template>
	<UModal
		v-model:open="open"
		:title="
			resource
				? t('vex.resources.form.editTitle')
				: t('vex.resources.form.newTitle')
		"
	>
		<template #body>
			<form class="VexForm" @submit.prevent="save">
				<UFormField :label="t('vex.resources.fields.title')" required>
					<UInput v-model="form.title" class="VexFormInput" />
				</UFormField>
				<UFormField :label="t('vex.resources.fields.url')" required>
					<UInput
						v-model="form.url"
						type="url"
						placeholder="https://"
						class="VexFormInput"
					/>
				</UFormField>
				<UFormField :label="t('vex.resources.fields.description')">
					<UTextarea
						v-model="form.description"
						:rows="2"
						autoresize
						class="VexFormInput"
					/>
				</UFormField>
				<div class="VexFormRow">
					<UFormField :label="t('vex.resources.fields.category')">
						<USelect
							v-model="form.category"
							:items="categoryItems"
							class="VexFormSelect"
						/>
					</UFormField>
					<UFormField :label="t('vex.resources.fields.resourceType')">
						<USelect
							v-model="form.resourceType"
							:items="typeItems"
							class="VexFormSelect"
						/>
					</UFormField>
				</div>
				<div class="VexFormRow">
					<UFormField :label="t('vex.resources.fields.season')">
						<USelect
							v-model="form.seasonId"
							:items="seasonItems"
							class="VexFormSelect"
						/>
					</UFormField>
					<UFormField :label="t('vex.resources.fields.sortOrder')">
						<UInputNumber v-model="form.sortOrder" :step="10" />
					</UFormField>
				</div>
				<USwitch
					v-model="form.isActive"
					:label="t('vex.resources.fields.isActive')"
				/>
			</form>
		</template>

		<template #footer>
			<div class="VexFormFooter">
				<UButton
					v-if="resource"
					color="error"
					variant="ghost"
					icon="i-lucide-trash-2"
					:label="t('vex.actions.delete')"
					:disabled="isSaving"
					@click="remove"
				/>
				<span class="VexFormFooterSpacer" />
				<UButton
					color="neutral"
					variant="ghost"
					:label="t('vex.actions.cancel')"
					@click="close"
				/>
				<UButton
					:label="t('vex.actions.save')"
					:loading="isSaving"
					:disabled="!canSave"
					@click="save"
				/>
			</div>
		</template>
	</UModal>
</template>

<style scoped lang="scss">
	.VexForm {
		display: flex;
		flex-direction: column;
		gap: calc(var(--spacing) * 4);
	}

	.VexFormRow {
		display: flex;
		gap: calc(var(--spacing) * 3);
		flex-wrap: wrap;
	}

	.VexFormInput {
		width: 100%;
	}

	.VexFormSelect {
		min-width: 12rem;
	}

	.VexFormFooter {
		display: flex;
		align-items: center;
		gap: calc(var(--spacing) * 2);
		width: 100%;
	}

	.VexFormFooterSpacer {
		flex: 1;
	}
</style>
