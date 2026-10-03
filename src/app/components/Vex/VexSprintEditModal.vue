<script setup lang="ts">
	import {
		VEX_SPRINT_STATUSES,
		type VexSprintModel,
		type VexSprintSaveModel,
		type VexSprintStatus,
	} from "#shared/types/models/VexSprintModel";
	import { VexSuggestNextSprint, VexToday } from "#shared/utils/VexHelpers";
	import { useVexStore } from "~/stores/useVexStore";

	const props = defineProps<{
		sprint: VexSprintModel | null;
		seasonId: string;
	}>();

	const emit = defineEmits<{
		saved: [sprint: VexSprintModel];
	}>();

	const open = defineModel<boolean>("open", { default: false });

	type SprintForm = {
		sprintNumber: number;
		title: string;
		objective: string;
		mentorNotes: string;
		startDate: string;
		reviewDate: string;
		status: VexSprintStatus;
	};

	const { t } = useI18n();
	const toast = useToast();
	const { Sprints, saveSprint } = useVexStore();

	const form = ref<SprintForm>(blankForm());
	const isSaving = ref<boolean>(false);

	const isNew = computed<boolean>(() => !props.sprint);

	const modalTitle = computed<string>(() =>
		props.sprint
			? t("vex.sprint.form.editTitle", { number: props.sprint.sprintNumber })
			: t("vex.sprint.form.newTitle"),
	);

	const statusItems = computed<{ label: string; value: VexSprintStatus }[]>(
		() =>
			VEX_SPRINT_STATUSES.map((status) => ({
				label: t(`vex.sprint.status.${status}`),
				value: status,
			})),
	);

	const canSave = computed<boolean>(
		() => form.value.sprintNumber >= 1 && !isSaving.value,
	);

	/**
	 * Empty form values
	 */
	function blankForm(): SprintForm {
		return {
			sprintNumber: 1,
			title: "",
			objective: "",
			mentorNotes: "",
			startDate: "",
			reviewDate: "",
			status: "current",
		};
	}

	/**
	 * Load the form from the sprint being edited, or suggest the next week
	 */
	function resetForm(): void {
		if (props.sprint) {
			form.value = {
				sprintNumber: props.sprint.sprintNumber,
				title: props.sprint.title ?? "",
				objective: props.sprint.objective ?? "",
				mentorNotes: props.sprint.mentorNotes ?? "",
				startDate: props.sprint.startDate ?? "",
				reviewDate: props.sprint.reviewDate ?? "",
				status: props.sprint.status,
			};
			return;
		}
		const suggestion = VexSuggestNextSprint(
			Sprints.value,
			props.seasonId,
			VexToday(),
		);
		form.value = {
			...blankForm(),
			sprintNumber: suggestion.sprintNumber,
			startDate: suggestion.startDate,
			reviewDate: suggestion.reviewDate,
		};
	}

	/**
	 * Save the sprint and close
	 */
	async function save(): Promise<void> {
		if (!canSave.value) {
			return;
		}
		isSaving.value = true;
		try {
			const payload: VexSprintSaveModel = {
				id: props.sprint?.id,
				seasonId: props.seasonId,
				sprintNumber: Number(form.value.sprintNumber),
				title: form.value.title.trim() || null,
				objective: form.value.objective.trim() || null,
				mentorNotes: form.value.mentorNotes.trim() || null,
				startDate: form.value.startDate || null,
				reviewDate: form.value.reviewDate || null,
				status: form.value.status,
			};
			const saved: VexSprintModel = await saveSprint(payload);
			open.value = false;
			emit("saved", saved);
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
	<UModal v-model:open="open" :title="modalTitle">
		<template #body>
			<form class="VexForm" @submit.prevent="save">
				<div class="VexFormRow">
					<UFormField :label="t('vex.sprint.fields.sprintNumber')" required>
						<UInputNumber v-model="form.sprintNumber" :min="1" />
					</UFormField>
					<UFormField :label="t('vex.sprint.fields.title')" class="VexFormGrow">
						<UInput v-model="form.title" class="VexFormInput" />
					</UFormField>
				</div>

				<UFormField :label="t('vex.sprint.fields.objective')">
					<UTextarea
						v-model="form.objective"
						:placeholder="t('vex.sprint.fields.objectivePlaceholder')"
						:rows="3"
						autoresize
						class="VexFormInput"
					/>
				</UFormField>

				<UFormField :label="t('vex.sprint.fields.mentorNotes')">
					<UTextarea
						v-model="form.mentorNotes"
						:rows="3"
						autoresize
						class="VexFormInput"
					/>
				</UFormField>

				<div class="VexFormRow">
					<UFormField :label="t('vex.sprint.fields.startDate')">
						<UInput v-model="form.startDate" type="date" />
					</UFormField>
					<UFormField :label="t('vex.sprint.fields.reviewDate')">
						<UInput v-model="form.reviewDate" type="date" />
					</UFormField>
				</div>

				<UFormField
					:label="t('vex.sprint.fields.status')"
					:help="t('vex.sprint.fields.statusHelp')"
				>
					<URadioGroup
						v-model="form.status"
						:items="statusItems"
						orientation="horizontal"
					/>
				</UFormField>
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

	.VexFormGrow {
		flex: 1;
		min-width: 12rem;
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
