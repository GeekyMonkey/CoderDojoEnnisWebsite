<script setup lang="ts">
	import type {
		VexSeasonModel,
		VexSeasonSaveModel,
	} from "#shared/types/models/VexSeasonModel";
	import { useVexStore } from "~/stores/useVexStore";

	const props = defineProps<{
		season: VexSeasonModel | null;
	}>();

	const open = defineModel<boolean>("open", { default: false });

	type SeasonForm = {
		slug: string;
		seasonLabel: string;
		programName: string;
		competitionName: string;
		description: string;
		isCurrent: boolean;
		startDate: string;
		endDate: string;
	};

	const DEFAULT_PROGRAM: string = "VEX IQ Robotics Competition";

	const { t } = useI18n();
	const toast = useToast();
	const { saveSeason } = useVexStore();

	const form = ref<SeasonForm>(blankForm());
	const isSaving = ref<boolean>(false);

	const canSave = computed<boolean>(
		() =>
			!isSaving.value &&
			/^[a-z0-9-]+$/.test(form.value.slug) &&
			form.value.seasonLabel.trim().length > 0 &&
			form.value.competitionName.trim().length > 0,
	);

	/**
	 * Empty form values
	 */
	function blankForm(): SeasonForm {
		return {
			slug: "",
			seasonLabel: "",
			programName: DEFAULT_PROGRAM,
			competitionName: "",
			description: "",
			isCurrent: true,
			startDate: "",
			endDate: "",
		};
	}

	/**
	 * Load the form from the season being edited
	 */
	function resetForm(): void {
		form.value = props.season
			? {
					slug: props.season.slug,
					seasonLabel: props.season.seasonLabel,
					programName: props.season.programName,
					competitionName: props.season.competitionName,
					description: props.season.description ?? "",
					isCurrent: props.season.isCurrent,
					startDate: props.season.startDate ?? "",
					endDate: props.season.endDate ?? "",
				}
			: blankForm();
	}

	/**
	 * Save the season and close
	 */
	async function save(): Promise<void> {
		if (!canSave.value) {
			return;
		}
		isSaving.value = true;
		try {
			const payload: VexSeasonSaveModel = {
				id: props.season?.id,
				slug: form.value.slug.trim(),
				seasonLabel: form.value.seasonLabel.trim(),
				programName: form.value.programName.trim() || DEFAULT_PROGRAM,
				competitionName: form.value.competitionName.trim(),
				description: form.value.description.trim() || null,
				isCurrent: form.value.isCurrent,
				startDate: form.value.startDate || null,
				endDate: form.value.endDate || null,
			};
			await saveSeason(payload);
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
			season ? t('vex.season.form.editTitle') : t('vex.season.form.newTitle')
		"
	>
		<template #body>
			<form class="VexForm" @submit.prevent="save">
				<UFormField :label="t('vex.season.fields.seasonLabel')" required>
					<UInput v-model="form.seasonLabel" class="VexFormInput" />
				</UFormField>
				<UFormField :label="t('vex.season.fields.competitionName')" required>
					<UInput v-model="form.competitionName" class="VexFormInput" />
				</UFormField>
				<UFormField :label="t('vex.season.fields.programName')">
					<UInput v-model="form.programName" class="VexFormInput" />
				</UFormField>
				<UFormField :label="t('vex.season.fields.slug')" required>
					<UInput v-model="form.slug" class="VexFormInput" />
				</UFormField>
				<UFormField :label="t('vex.season.fields.description')">
					<UTextarea
						v-model="form.description"
						:rows="2"
						autoresize
						class="VexFormInput"
					/>
				</UFormField>
				<div class="VexFormRow">
					<UFormField :label="t('vex.season.fields.startDate')">
						<UInput v-model="form.startDate" type="date" />
					</UFormField>
					<UFormField :label="t('vex.season.fields.endDate')">
						<UInput v-model="form.endDate" type="date" />
					</UFormField>
				</div>
				<USwitch
					v-model="form.isCurrent"
					:label="t('vex.season.fields.isCurrent')"
				/>
			</form>
		</template>

		<template #footer>
			<div class="VexFormFooter">
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

	.VexFormFooter {
		display: flex;
		justify-content: flex-end;
		gap: calc(var(--spacing) * 2);
		width: 100%;
	}
</style>
