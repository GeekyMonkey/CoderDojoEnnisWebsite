<script setup lang="ts">
	import GoalFieldsDisplay from "~/components/Profile/GoalFieldsDisplay.vue";
	import MemberProgress from "~/components/Achievements/MemberProgress.vue";
	import type { ProfileMode } from "#shared/types/MemberProfile";
	import { useActionNotifications } from "~/composables/useActionNotifications";
	import { requestFailureMessage } from "#shared/utils/RequestFailure";
	import { computed, watch, type ComputedRef } from "vue";
	import { goalFieldsSchema, goalSnapshot, type GoalFields, type GuardedUpdate } from "#shared/types/MemberMaintenance";
	import type { MemberModel } from "#shared/types/models/MemberModel";
	import { useMemberSectionDraft } from "~/composables/useMemberSectionDraft";
	const props = withDefaults(defineProps<{ member: MemberModel; saving: boolean; mode?: ProfileMode; showProgress?:boolean; save: (body: GuardedUpdate<GoalFields>) => Promise<unknown> }>(),{showProgress:true, mode: "view"});
	const KEYS: (keyof GoalFields)[] = ["goalShortTerm", "goalLongTerm"];
	const emit = defineEmits<{ cancel: [] }>();
	const { t } = useI18n();
	const { publish } = useActionNotifications();
	const editing: ComputedRef<boolean> = computed((): boolean => props.mode === "edit");

	const { fields, baseline, dirty, remoteChanged, reset } = useMemberSectionDraft((): MemberModel => props.member, goalSnapshot);
	/** Discard unsaved goals and return to display mode. */
	function cancel(): void { reset(); emit("cancel"); }
	/** Save validated goals through the caller's store action. */
	async function submit(): Promise<void> {
		if (!editing.value || props.saving || remoteChanged.value) return;
		try { await props.save({ fields: goalFieldsSchema.parse(fields), expected: baseline.value }); reset(); publish({ name: "maintenance.membergoals.success", severity: "success", message: t("actionNotifications.saved") }); }
		catch (failure: unknown) { publish({ name: "maintenance.membergoals.error", severity: "error", message: requestFailureMessage(failure) ?? t("maintenance.saveError") }); }
	}
	watch((): ProfileMode => props.mode, (): void => { reset(); });
</script>
<template>
	<UPageCard :title="t('maintenance.goals')">
		<template v-if="!editing"><GoalFieldsDisplay :member="member" /></template>
		<UForm v-else :schema="goalFieldsSchema" :state="fields" class="Goals" @submit="submit">
			<UFormField v-for="key in KEYS" :key="key" :name="key" :label="t(`maintenance.${key}`)"><UTextarea :modelValue="fields[key] ?? ''" :disabled="saving" class="GoalInput" @update:modelValue="(value: string): void => { fields[key] = value; }" /></UFormField>
			<UAlert v-if="remoteChanged" color="warning" :title="t('profile.remoteChanged')" />
			<div class="GoalActions"><UButton type="submit" :loading="saving" :disabled="!dirty || remoteChanged">{{ t('profile.save') }}</UButton><UButton variant="outline" :disabled="saving" @click="cancel">{{ t('profile.cancel') }}</UButton></div>
		</UForm>
		<MemberProgress v-if="showProgress" :memberId="member.id" />
	</UPageCard>
</template>
<style scoped lang="scss">
	.Goals { display: grid; gap: calc(var(--spacing) * 4); } .Goals dt { font-weight: 600; } .Goals dd { margin: 0; white-space: pre-wrap; }
	.GoalInput { width: 100%; } .GoalActions { display: flex; gap: calc(var(--spacing) * 3); }
</style>
