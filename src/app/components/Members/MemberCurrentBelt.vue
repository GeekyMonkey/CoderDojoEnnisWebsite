<script setup lang="ts">
 import type { MemberModel } from "#shared/types/models/MemberModel";
 import MemberBelt from "./MemberBelt.vue";
 const props = defineProps<{ member: MemberModel; size?: "sm" | "md" | "lg" }>();
 const { t } = useI18n();
</script>
<template>
 <div v-if="props.member.isNinja" class="CurrentBelt" :class="{ Compact: size === 'sm' }">
  <span>{{ t('achievementReviews.currentBelt') }}</span>
  <MemberBelt :member="props.member" earnedOnly :size="size ?? 'lg'" />
 </div>
</template>
<style scoped lang="scss">
 .CurrentBelt { display: grid; align-items: center; gap: calc(var(--spacing) * 2); font-size: var(--text-xs); color: var(--ui-text-muted); }
 .Compact { display: inline-flex; }
</style>
