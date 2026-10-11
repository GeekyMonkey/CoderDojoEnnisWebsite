<script setup lang="ts">
 import { useActionNotifications } from "~/composables/useActionNotifications";
 import { computed, ref, type Ref, type ComputedRef } from "vue";
 import { teamIdSchema, teamSnapshot, type TeamFields } from "#shared/types/TeamMaintenance";
 import type { TeamModel } from "#shared/types/models/TeamModel";
 import type { MemberModel } from "#shared/types/models/MemberModel";
 import { useTeamMaintenanceStore } from "~/stores/useTeamMaintenanceStore";
 import { useMemberMaintenanceStore } from "~/stores/useMemberMaintenanceStore";
 import { requestFailureMessage } from "#shared/utils/RequestFailure";
 const props = defineProps<{ teamId: string }>();
 const { t } = useI18n();
 const { publish } = useActionNotifications();
 const store: ReturnType<typeof useTeamMaintenanceStore> = useTeamMaintenanceStore();
 const members: ReturnType<typeof useMemberMaintenanceStore> = useMemberMaintenanceStore();
 const { teams, isPending, isError, isSaving } = store;
 const editing: Ref<boolean> = ref(false);
 const deleteSnapshot: Ref<TeamFields | null> = ref(null);

 const valid: ComputedRef<boolean> = computed((): boolean => teamIdSchema.safeParse(props.teamId).success);
 const team: ComputedRef<TeamModel | null> = computed((): TeamModel | null => teams.value.find((item: TeamModel): boolean => item.id === props.teamId) ?? null);
 const assigned: ComputedRef<MemberModel[]> = computed((): MemberModel[] => (members.data.value?.members ?? []).filter((member: MemberModel): boolean => member.teamId === props.teamId));
 const staleDelete: ComputedRef<boolean> = computed((): boolean => !!team.value && JSON.stringify(deleteSnapshot.value) !== JSON.stringify(teamSnapshot(team.value)));
 const details: ComputedRef<{ key: string; value: string }[]> = computed((): { key: string; value: string }[] => ["goal", "notes", "hexcode"].map((key: string): { key: string; value: string } => ({ key: key === "hexcode" ? "colour" : key, value: String(team.value?.[key as "goal" | "notes" | "hexcode"] ?? "—") })));
 /** Save the selected team's protected snapshot through its store. */
 async function save(fields: TeamFields, expected: TeamFields | null): Promise<TeamModel> { if (!expected) throw new Error(t("teams.notFound")); return store.save(props.teamId, { fields, expected }); }
 /** Capture the exact team being confirmed for deletion. */
 function confirmDelete(): void { if (team.value) {  deleteSnapshot.value = teamSnapshot(team.value); } }
 /** Soft-delete the confirmed unassigned team, then return to its directory. */
 async function remove(): Promise<void> {
  if (!deleteSnapshot.value || isSaving.value || staleDelete.value) return;
  try { await store.remove(props.teamId, { expected: deleteSnapshot.value }); publish({ name: "teams.teamdetail.success", severity: "success", message: t("actionNotifications.deleted") }); await navigateTo("/mentor/maintenance/teams"); }
  catch (failure: unknown) { publish({ name: "teams.teamdetail.error", severity: "error", message: requestFailureMessage(failure) ?? t("teams.saveError") }); }
 }
</script>
<template>
 <UDashboardPanel id="mentor-maintenance-team">
  <template #header><DashboardHeading :pageTitle="team?.teamName ?? t('teams.label')" :breadcrumbLabel="t('teams.plural')" breadcrumbTo="/mentor/maintenance/teams" /></template>
  <template #body><div class="TeamDetail">
   <p v-if="isPending">{{ t('profile.loading') }}</p><UAlert v-else-if="isError" color="error" :title="t('teams.loadError')" /><UAlert v-else-if="!valid || !team" color="error" :title="t('teams.notFound')" />
   <template v-else>
    <UPageCard :title="t('profile.details')">
     <TeamForm v-if="editing" :key="teamId" :team="team" :saving="isSaving" :save="save" @saved="editing = false" @cancel="editing = false" />
     <template v-else><div class="TeamHeading"><ColourSwatch :hexCode="team.hexcode" /><span>{{ team.teamName }}</span></div><dl class="TeamDisplay"><div v-for="item in details" :key="item.key"><dt>{{ t(`teams.${item.key}`) }}</dt><dd>{{ item.value }}</dd></div></dl><UButton class="TeamEdit" @click="editing = true">{{ t('teams.edit') }}</UButton></template>
    </UPageCard>
    <UPageCard :title="t('nav.Members')"><p v-if="members.isPending.value">{{ t('profile.loading') }}</p><UAlert v-else-if="members.isError.value" color="error" :title="t('profile.loadError')" /><template v-else><ul v-if="assigned.length"><li v-for="member in assigned" :key="member.id"><NuxtLink :to="`/mentor/member/${member.id}`">{{ member.nameFirst }} {{ member.nameLast }}</NuxtLink></li></ul><p v-else>{{ t('teams.noMembers') }}</p></template></UPageCard>
    <UPageCard v-if="deleteSnapshot" :title="t('teams.deleteConfirm')"><p>{{ t('teams.deleteDescription') }}</p><UAlert v-if="staleDelete" color="warning" :title="t('teams.remoteChanged')" /><div class="TeamActions"><UButton color="error" :loading="isSaving" :disabled="staleDelete || assigned.length > 0 || members.isPending.value || members.isError.value" @click="remove">{{ t('teams.delete') }}</UButton><UButton variant="outline" :disabled="isSaving" @click="deleteSnapshot = null">{{ t('profile.cancel') }}</UButton></div></UPageCard>
    <UButton v-else class="TeamEdit" color="error" variant="outline" :disabled="editing || isSaving" @click="confirmDelete">{{ t('teams.delete') }}</UButton>
   </template>
  </div></template>
 </UDashboardPanel>
</template>
<style scoped lang="scss">
 .TeamDetail { display: grid; gap: calc(var(--spacing) * 5); padding: calc(var(--spacing) * 4); max-width: 70rem; }
 .TeamDisplay { display: grid; gap: calc(var(--spacing) * 4); } .TeamDisplay dt { font-weight: 600; } .TeamDisplay dd { margin: 0; white-space: pre-wrap; overflow-wrap: anywhere; }
 .TeamHeading, .TeamActions { display: flex; align-items: center; gap: calc(var(--spacing) * 3); } .TeamEdit { width: fit-content; justify-self: start; }
</style>
