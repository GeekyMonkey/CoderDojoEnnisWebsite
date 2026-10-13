<script setup lang="ts">
 import { computed, type ComputedRef } from "vue";
 import type { AchievementReview } from "#shared/types/AchievementReview";
 import { coderRecentDecisions } from "#shared/utils/CoderWelcome";
 import { useCoderContextStore } from "~/stores/useCoderContextStore";
 import { useMemberAttendanceHistoryStore } from "~/stores/useMemberAttendanceHistoryStore";
 import { useCoderAchievements } from "~/composables/useCoderAchievements";
 import CoderWelcome from "~/components/Coder/CoderWelcome.vue";
 import CoderDecisionFeedback from "~/components/Coder/CoderDecisionFeedback.vue";
 import TeamRoster from "~/components/Teams/TeamRoster.vue";
 import BeltColor from "~/components/Belts/BeltColor.vue";
 const { t } = useI18n();
 const { pageTitle } = useMemberLayoutContext();
 const context: ReturnType<typeof useCoderContextStore> = useCoderContextStore();
 const attendance: ReturnType<typeof useMemberAttendanceHistoryStore> = useMemberAttendanceHistoryStore(null);
 const badges: ReturnType<typeof useCoderAchievements> = useCoderAchievements("badge");
 const belts: ReturnType<typeof useCoderAchievements> = useCoderAchievements("belt");
 type CoderLink = { path: string; label: string };
 const LINKS: CoderLink[] = [{path:"profile",label:"userMenu.profile"},{path:"goals",label:"maintenance.goals"},{path:"badges",label:"achievementReviews.badgeHistory"},{path:"badges-available",label:"achievementReviews.available"},{path:"belts",label:"achievementReviews.beltHistory"},{path:"attendance",label:"maintenance.attendance"},{path:"sessions",label:"sessions.label"}];
 const decisions: ComputedRef<AchievementReview[]> = computed((): AchievementReview[] => coderRecentDecisions(
  [...(badges.store.data.value ?? []), ...(belts.store.data.value ?? [])], context.data.value?.member.loginDatePrevious ?? null,
 ));
 const achievementsLoading: ComputedRef<boolean> = computed((): boolean => badges.store.isPending.value || belts.store.isPending.value);
 const achievementsError: ComputedRef<boolean> = computed((): boolean => badges.store.isError.value || belts.store.isError.value);
</script>

<template>
 <UDashboardPanel id="coder-home">
  <template #header><DashboardHeading :pageTitle="pageTitle" /></template>
  <template #body>
   <div class="CoderHome">
    <p v-if="context.isPending.value">{{ t('profile.loading') }}</p>
    <UAlert v-else-if="context.isError.value" color="error" :title="t('profile.loadError')" />
    <template v-else-if="context.data.value">
     <CoderWelcome :member="context.data.value.member" :teamName="context.data.value.team?.teamName ?? null" :attendanceCount="attendance.data.value?.length ?? null">
      <UAlert v-if="attendance.isError.value" color="error" :title="t('profile.loadError')" />
      <p v-if="achievementsLoading">{{ t('profile.loading') }}</p>
      <UAlert v-else-if="achievementsError" color="error" :title="t('achievementReviews.loadError')" />
      <div v-else class="CurrentBelt"><span>{{ t('achievementReviews.currentBelt') }}</span><BeltColor :belt="belts.currentBelt.value?.belt ?? 'noob'" size="lg" /></div>
     </CoderWelcome>
     <nav class="CoderLinks" :aria-label="t('coder.yourActivities')">
      <UButton v-for="link in LINKS" :key="link.path" :to="`/coder/${link.path}`" variant="outline">{{ t(link.label) }}</UButton>
     </nav>
     <CoderDecisionFeedback v-if="!achievementsLoading && !achievementsError" :decisions="decisions" />
     <UPageCard :title="t('maintenance.goals')">
      <dl class="GoalsPreview"><div><dt>{{ t('maintenance.goalShortTerm') }}</dt><dd>{{ context.data.value.member.goalShortTerm || '—' }}</dd></div><div><dt>{{ t('maintenance.goalLongTerm') }}</dt><dd>{{ context.data.value.member.goalLongTerm || '—' }}</dd></div></dl>
      <UButton to="/coder/goals" variant="outline" class="GoalLink">{{ t('coder.viewGoals') }}</UButton>
     </UPageCard>
     <TeamRoster :team="context.data.value.team" :members="context.data.value.roster" profileBase="/coder/team-members" />
    </template>
   </div>
  </template>
 </UDashboardPanel>
</template>

<style scoped lang="scss">
 .CoderHome { display: grid; gap: calc(var(--spacing) * 6); padding: calc(var(--spacing) * 4); max-width: 60rem; min-width: 0; }
 .CoderLinks { display: flex; flex-wrap: wrap; gap: calc(var(--spacing) * 3); }
 .CurrentBelt { display: grid; gap: calc(var(--spacing) * 2); }
 .GoalsPreview { display: grid; gap: calc(var(--spacing) * 4); }
 .GoalsPreview dt { font-weight: 600; }
 .GoalsPreview dd { white-space: pre-wrap; overflow-wrap: anywhere; }
 .GoalLink { justify-self: start; }
</style>
