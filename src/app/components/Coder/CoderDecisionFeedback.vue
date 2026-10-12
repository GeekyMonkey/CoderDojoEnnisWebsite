<script setup lang="ts">
 import type { AchievementReview } from "#shared/types/AchievementReview";
 import AchievementEvidence from "~/components/Achievements/AchievementEvidence.vue";
 import BeltColor from "~/components/Belts/BeltColor.vue";
 const props = defineProps<{ decisions: AchievementReview[] }>();
 const { t } = useI18n();
</script>

<template>
 <section v-if="decisions.length" class="DecisionFeedback">
  <h2>{{ t('coder.recentDecisions') }}</h2>
  <UPageCard v-for="decision in decisions" :key="`${decision.kind}-${decision.id}`">
   <h3>{{ t(decision.awarded !== null ? 'coder.earnedCongratulations' : 'coder.applicationFeedback', { name: decision.label }) }}</h3>
   <BeltColor v-if="decision.belt" :belt="decision.belt" size="md" />
   <p v-else>{{ decision.categoryName }}</p>
   <AchievementEvidence :review="decision" />
   <UButton :to="decision.kind === 'belt' ? '/coder/belts' : '/coder/badges-available'" variant="outline" class="DecisionLink">{{ t('coder.viewAchievement') }}</UButton>
  </UPageCard>
 </section>
</template>

<style scoped lang="scss">
 .DecisionFeedback { display: grid; gap: calc(var(--spacing) * 4); }
 h2 { font-size: var(--text-lg); font-weight: 600; }
 h3 { font-weight: 600; }
 .DecisionLink { justify-self: start; }
</style>
