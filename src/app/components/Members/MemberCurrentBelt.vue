<script setup lang="ts">
 import type { MemberModel } from "#shared/types/models/MemberModel";
 import MemberBelt from "./MemberBelt.vue";
 const props = defineProps<{ member: MemberModel; mode?: "small" | "big" }>();
 const { t } = useI18n();
</script>
<template>
 <div v-if="props.member.isNinja" class="CurrentBelt" :class="{ Compact: mode === 'small' }">
  <span>{{ t('achievementReviews.currentBelt') }}</span>
  <MemberBelt :member="props.member" earnedOnly :mode="mode ?? 'big'" showLabel class="CurrentBeltValue" />
 </div>
</template>
<style scoped lang="scss">
 .CurrentBelt { width: 100%; display: grid; flex-wrap: wrap; align-items: center; gap: calc(var(--spacing) * 2); font-size: var(--text-xs); color: var(--ui-text-muted); }
 .Compact { display: inline-flex; }
 .Compact .CurrentBeltValue { width: 5rem; max-width: 100%; }
</style>
