<script setup lang="ts">
	import type { MemberModel } from "#shared/types/models/MemberModel";
	import {
		VEX_TASK_STATUSES,
		type VexTaskModel,
		type VexTaskSaveModel,
		type VexTaskStatus,
	} from "#shared/types/models/VexTaskModel";
	import { useMembersStore } from "~/stores/useMembersStore";
	import { useVexStore } from "~/stores/useVexStore";

	const props = defineProps<{
		task: VexTaskModel | null;
		sprintId: string;
	}>();

	const open = defineModel<boolean>("open", { default: false });

	type MemberOption = {
		label: string;
		value: string;
	};

	type TaskForm = {
		title: string;
		ownerMemberIds: string[];
		status: VexTaskStatus;
		notes: string;
		linkUrl: string;
	};

	const { t } = useI18n();
	const toast = useToast();
	const { memberName } = useVexFormat();
	const { Members } = useMembersStore();
	const { CurrentMemberId, IsMentor, saveTask, deleteTask } = useVexStore();

	const form = ref<TaskForm>(emptyForm());
	const isSaving = ref<boolean>(false);

	const isNew = computed<boolean>(() => !props.task);

	const canDelete = computed<boolean>(
		() =>
			!!props.task &&
			(IsMentor.value ||
				props.task.createdByMemberId === CurrentMemberId.value),
	);

	/**
	 * Coders and mentors who can take responsibility for a task
	 */
	const memberOptions = computed<MemberOption[]>(() =>
		(Members.value ?? [])
			.filter(
				(m: MemberModel) =>
					!m.deleted &&
					(m.isNinja || m.isMentor || form.value.ownerMemberIds.includes(m.id)),
			)
			.map((m: MemberModel) => ({ label: memberName(m), value: m.id }))
			.sort((a, b) => a.label.localeCompare(b.label)),
	);

	const statusItems = computed<{ label: string; value: VexTaskStatus }[]>(() =>
		VEX_TASK_STATUSES.map((status) => ({
			label: t(`vex.task.status.${status}`),
			value: status,
		})),
	);

	const canSave = computed<boolean>(
		() => form.value.title.trim().length > 0 && !isSaving.value,
	);

	/**
	 * Blank form; a new task is owned by whoever adds it
	 */
	function emptyForm(): TaskForm {
		return {
			title: "",
			ownerMemberIds: [],
			status: "todo",
			notes: "",
			linkUrl: "",
		};
	}

	/**
	 * Load the form from the task being edited
	 */
	function resetForm(): void {
		if (props.task) {
			form.value = {
				title: props.task.title,
				ownerMemberIds: [...props.task.ownerMemberIds],
				status: props.task.status,
				notes: props.task.notes ?? "",
				linkUrl: props.task.linkUrl ?? "",
			};
		} else {
			form.value = emptyForm();
			if (CurrentMemberId.value) {
				form.value.ownerMemberIds = [CurrentMemberId.value];
			}
		}
	}

	/**
	 * Add https:// to bare links so members can paste "example.com"
	 */
	function normaliseLink(value: string): string | null {
		const trimmed: string = value.trim();
		if (!trimmed) {
			return null;
		}
		return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
	}

	/**
	 * Save the task and close
	 */
	async function save(): Promise<void> {
		if (!canSave.value) {
			return;
		}
		isSaving.value = true;
		try {
			const payload: VexTaskSaveModel = {
				id: props.task?.id,
				sprintId: props.sprintId,
				title: form.value.title.trim(),
				ownerMemberIds: form.value.ownerMemberIds,
				status: form.value.status,
				notes: form.value.notes.trim() || null,
				linkUrl: normaliseLink(form.value.linkUrl),
			};
			await saveTask(payload);
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
	 * Remove the task and close
	 */
	async function remove(): Promise<void> {
		if (!props.task) {
			return;
		}
		isSaving.value = true;
		try {
			await deleteTask(props.task.id);
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
		:title="isNew ? t('vex.task.form.newTitle') : t('vex.task.form.editTitle')"
	>
		<template #body>
			<form class="VexForm" @submit.prevent="save">
				<UFormField :label="t('vex.task.fields.title')" required>
					<UInput v-model="form.title" class="VexFormInput" autofocus />
				</UFormField>

				<UFormField :label="t('vex.task.fields.owners')">
					<USelectMenu
						v-model="form.ownerMemberIds"
						:items="memberOptions"
						value-key="value"
						multiple
						:placeholder="t('vex.task.fields.ownersPlaceholder')"
						class="VexFormInput"
					/>
				</UFormField>

				<UFormField :label="t('vex.task.fields.status')">
					<URadioGroup
						v-model="form.status"
						:items="statusItems"
						orientation="horizontal"
					/>
				</UFormField>

				<UFormField :label="t('vex.task.fields.notes')">
					<UTextarea
						v-model="form.notes"
						:placeholder="t('vex.task.fields.notesPlaceholder')"
						:rows="5"
						autoresize
						class="VexFormInput"
					/>
				</UFormField>

				<UFormField :label="t('vex.task.fields.link')">
					<UInput
						v-model="form.linkUrl"
						type="url"
						placeholder="https://"
						class="VexFormInput"
					/>
				</UFormField>
			</form>
		</template>

		<template #footer>
			<div class="VexFormFooter">
				<UButton
					v-if="canDelete"
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

	.VexFormInput {
		width: 100%;
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
