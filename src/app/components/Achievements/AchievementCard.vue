<script setup lang="ts">
 import type { AchievementReview } from "#shared/types/AchievementReview";
 import BeltColor from "~/components/Belts/BeltColor.vue";
 import AchievementEvidence from "./AchievementEvidence.vue";
 const props = defineProps<{review:AchievementReview;history:AchievementReview[];goalDate:number|null;open?:boolean}>();
 const {t} = useI18n();
</script>
<template><UPageCard><details :open="open ?? false"><summary class="AchievementHeading"><BeltColor v-if="review.belt" :belt="review.belt" mode="big" /><h3 v-else>{{ review.categoryName ?? t('definitionMaintenance.unavailableCategory') }} — {{ review.label }}</h3><span v-if="goalDate!==null">★ {{ t('achievementReviews.goal') }}</span></summary><div class="AchievementBody"><p class="Description">{{ review.description }}</p><p v-if="review.definitionDeleted">{{ t('achievementReviews.archived') }}</p><AchievementEvidence v-for="entry in history" :key="entry.id" :review="entry" /><slot /></div></details></UPageCard></template>
<style scoped lang="scss">.AchievementHeading { display:flex; align-items:center; flex-wrap:wrap; gap:calc(var(--spacing)*3); } .AchievementHeading { cursor:pointer; } .AchievementBody { display:grid; gap:calc(var(--spacing)*3); margin-top:calc(var(--spacing)*4); } h3 { font-weight:600; } .Description { white-space:pre-wrap; overflow-wrap:anywhere; }</style>
