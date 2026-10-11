<script setup lang="ts">
	import { useActionNotifications } from "~/composables/useActionNotifications";
	import { requestFailureMessage } from "#shared/utils/RequestFailure";
	import { ref, computed, type Ref, type ComputedRef } from "vue";
	import { accountFieldsSchema, accountSnapshot, type AccountFields, type GuardedUpdate } from "#shared/types/MemberMaintenance";
	import type { MemberModel } from "#shared/types/models/MemberModel";
	import type { TeamModel } from "#shared/types/models/TeamModel";
	import { useMemberSectionDraft } from "~/composables/useMemberSectionDraft";
	const props = defineProps<{ member: MemberModel; teams: TeamModel[]; saving: boolean; save: (body: GuardedUpdate<AccountFields>) => Promise<MemberModel> }>();
	const { t } = useI18n();
	const { publish } = useActionNotifications();
	const editing: Ref<boolean> = ref(false);

	const { fields, baseline, dirty, remoteChanged, reset } = useMemberSectionDraft((): MemberModel => props.member, accountSnapshot);
	const display: ComputedRef<{ key: string; value: string | boolean }[]> = computed((): { key: string; value: string | boolean }[] => Object.entries(accountSnapshot(props.member)).filter(([key]: [string, unknown]): boolean => (!["isNinja", "isParent", "isMentor"].includes(key)) && (!["birthYear", "teamId", "registeredCurrentTerm"].includes(key) || props.member.isNinja) && (key !== "gardaVetted" || props.member.isMentor)).map(([key, value]: [string, unknown]): { key: string; value: string | boolean } => ({ key: key === "teamId" ? "team" : key, value: key === "teamId" ? props.teams.find((team: TeamModel): boolean => team.id === value)?.teamName ?? t("maintenance.noTeam") : typeof value === "boolean" ? value : String(value ?? "—") })));
	/** Discard account edits and return to display mode. */
	function cancel(): void { reset(); editing.value = false;  }
	/** Save the validated account snapshot without overwriting remote changes. */
	async function submit(): Promise<void> {
		if (props.saving || remoteChanged.value) return;
		try { await props.save({ fields: accountFieldsSchema.parse(fields), expected: baseline.value }); cancel(); publish({ name: "maintenance.memberaccount.success", severity: "success", message: t("actionNotifications.saved") }); }
		catch (failure: unknown) { publish({ name: "maintenance.memberaccount.error", severity: "error", message: requestFailureMessage(failure) ?? t("maintenance.saveError") }); }
	}
</script>
<template>
	<UPageCard :title="t('maintenance.account')">
		<template v-if="!editing">
			<dl class="AccountDisplay"><div v-for="item in display" :key="item.key"><dt>{{ t(`maintenance.${item.key}`) }}</dt><dd><UCheckbox v-if="typeof item.value === 'boolean'" :modelValue="item.value" :aria-label="t(`maintenance.${item.key}`)" disabled /><template v-else>{{ item.value }}</template></dd></div></dl>
			<MemberRoles :modelValue="member" mode="view" />
			<UButton class="SectionEdit" @click="editing = true">{{ t('profile.edit') }}</UButton>
		</template>
		<UForm v-else :state="fields" :schema="accountFieldsSchema" class="AccountForm" @submit="submit">
			<AccountFields :fields="fields" :teams="teams" :disabled="saving" />
			<UAlert v-if="remoteChanged" color="warning" :title="t('profile.remoteChanged')" />

			<div class="AccountActions"><UButton type="submit" :loading="saving" :disabled="!dirty || remoteChanged">{{ t('profile.save') }}</UButton><UButton variant="outline" :disabled="saving" @click="cancel">{{ t('profile.cancel') }}</UButton></div>
		</UForm>
	</UPageCard>
</template>
<style scoped lang="scss">
	.SectionEdit { width: fit-content; align-self: flex-start; justify-self: start; }
	.AccountForm { display: grid; gap: calc(var(--spacing) * 4); }
	.AccountDisplay { display: grid; grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr)); gap: calc(var(--spacing) * 4); }
	.AccountDisplay dt { font-weight: 600; } .AccountDisplay dd { margin: 0; overflow-wrap: anywhere; }
	.AccountActions { display: flex; gap: calc(var(--spacing) * 3); }
</style>
