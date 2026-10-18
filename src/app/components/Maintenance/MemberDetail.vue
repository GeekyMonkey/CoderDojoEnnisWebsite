<script setup lang="ts">
 import { computed, ref, watch, type ComputedRef, type Ref } from "vue";
 import AchievementsReviewList from "~/components/Achievements/ReviewList.vue";
 import type { AccountFields, GoalFields, GuardedUpdate, PasswordReset } from "#shared/types/MemberMaintenance";
 import type { ProfileMode } from "#shared/types/MemberProfile";
 import type { MemberModel } from "#shared/types/models/MemberModel";
 import { profileIdentitySchema } from "#shared/types/MemberProfile";
 import { useMemberMaintenanceStore } from "~/stores/useMemberMaintenanceStore";
 const props = defineProps<{ memberId: string }>();
 type ProfileTab = { label: string; value: string; slot: string };
 const { t } = useI18n();
 const store: ReturnType<typeof useMemberMaintenanceStore> = useMemberMaintenanceStore();
 const { data, isPending, isError, isSaving } = store;
 const mode: Ref<ProfileMode> = ref("view");
 const tab: Ref<string | number> = ref("details");
 const valid: ComputedRef<boolean> = computed((): boolean => profileIdentitySchema.safeParse(props.memberId).success);
 const member: ComputedRef<MemberModel | null> = computed((): MemberModel | null => store.membersById.value[props.memberId] ?? null);
 const title: ComputedRef<string> = computed((): string => member.value ? `${member.value.nameFirst ?? ""} ${member.value.nameLast ?? ""}`.trim() : t("maintenance.member"));
 const tabs: ComputedRef<ProfileTab[]> = computed((): ProfileTab[] => [
  { label: t("profile.details"), value: "details", slot: "details" },
  ...(member.value?.isNinja ? ["parents", "badges", "belts", "goals", "attendance"].map((key: string): ProfileTab => ({ label: t(`parent.${key}`), value: key, slot: key })) : []),
  ...(member.value?.isParent ? [{ label: t("maintenance.children"), value: "children", slot: "children" }] : []),
  ...(member.value?.isMentor ? [{ label: t("maintenance.skills"), value: "skills", slot: "skills" }] : []),
 ]);
 /** Delegate account changes to the maintenance store. */
 async function saveAccount(body: GuardedUpdate<AccountFields>): Promise<MemberModel> { return store.saveAccount(props.memberId, body); }
 /** Delegate goal changes to the maintenance store. */
 async function saveGoals(body: GuardedUpdate<GoalFields>): Promise<MemberModel> { return store.saveGoals(props.memberId, body); }
 /** Delegate selected-user password resets to the maintenance store. */
 async function resetPassword(body: PasswordReset): Promise<null> { return store.resetPassword(props.memberId, body); }
 watch((): string => props.memberId, (): void => { mode.value = "view"; tab.value = "details"; });
 watch(tabs, (items: ProfileTab[]): void => { if (!items.some((item: ProfileTab): boolean => item.value === tab.value)) tab.value = "details"; });
</script>

<template>
 <UDashboardPanel id="user-profile">
  <template #header><DashboardHeading :pageTitle="title" /></template>
  <template #body>
   <div class="MemberDetail">
    <p v-if="isPending">{{ t('profile.loading') }}</p>
    <UAlert v-else-if="isError" color="error" :title="t('profile.loadError')" />
    <UAlert v-else-if="!valid || !member" color="error" :title="t('maintenance.notFound')" />
    <template v-else-if="member && data">
     <div class="MemberActions">
      <UButton v-if="mode === 'view'" @click="mode = 'edit'">{{ t('profile.edit') }}</UButton>
      <UButton v-else variant="outline" :disabled="isSaving" @click="mode = 'view'">{{ t('maintenance.done') }}</UButton>
      <UButton :to="`/mentor/showcase?memberId=${memberId}`" variant="outline">{{ t('nav.Showcase') }}</UButton>
      <UButton :to="`/mentor/maintenance/print?kind=member&memberId=${memberId}`" target="_blank" variant="outline">{{ t('printing.id') }}</UButton>
      <UButton v-if="member.isNinja" :to="`/mentor/maintenance/print?kind=certificate&memberId=${memberId}`" target="_blank" variant="outline">{{ t('printing.certificate') }}</UButton>
      <UButton v-if="mode === 'edit'" :to="`/mentor/maintenance/merge/${memberId}`" variant="outline">{{ t('accountMerge.title') }}</UButton>
     </div>
     <UTabs v-model="tab" :items="tabs" :unmountOnHide="false" class="ProfileTabs">
      <template #details>
       <div class="ProfileSection">
        <UserProfile :key="memberId" :memberId="memberId" :mode="mode" @cancel="mode = 'view'" />
        <MemberAccount :member="member" :mode="mode" :teams="data.teams" :saving="isSaving" :save="saveAccount" @cancel="mode = 'view'" />
        <ProfilePasswordDialog v-if="mode === 'edit'" :saving="isSaving" :resetPassword="resetPassword" />
       </div>
      </template>
      <template #parents><MemberRelationships :member="member" :mode="mode" :members="data.members" :relationships="data.relationships" side="parents" :saving="isSaving" :link="store.link" :unlink="store.unlink" /></template>
      <template #children><MemberRelationships :member="member" :mode="mode" :members="data.members" :relationships="data.relationships" side="children" :saving="isSaving" :link="store.link" :unlink="store.unlink" /></template>
      <template #badges><AchievementsReviewList kind="badge" :memberId="memberId" :mode="mode" /></template>
      <template #belts><AchievementsReviewList kind="belt" :memberId="memberId" :mode="mode" /></template>
      <template #goals><MemberGoals :member="member" :mode="mode" :saving="isSaving" :save="saveGoals" @cancel="mode = 'view'" /></template>
      <template #attendance><MemberAttendanceHistory :memberId="memberId" /></template>
      <template #skills><MemberSkills :memberId="memberId" :mode="mode" :categories="data.categories" :skills="data.skills" :saving="isSaving" :addSkill="store.addSkill" :removeSkill="store.removeSkill" /></template>
     </UTabs>
    </template>
   </div>
  </template>
 </UDashboardPanel>
</template>

<style scoped lang="scss">
 .MemberActions { display: flex; flex-wrap: wrap; gap: calc(var(--spacing) * 3); }
 .MemberDetail, .ProfileSection { display: grid; gap: calc(var(--spacing) * 6); min-width: 0; }
 .MemberDetail { padding: calc(var(--spacing) * 4); max-width: 70rem; }
 .ProfileTabs { min-width: 0; }
 .ProfileTabs :deep([role="tablist"]) { flex-wrap: wrap; }
</style>
