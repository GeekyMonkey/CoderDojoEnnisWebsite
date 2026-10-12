<script setup lang="ts">
 import type { MemberModel } from "#shared/types/models/MemberModel";
 import MemberBelt from "./MemberBelt.vue";
 const props = defineProps<{ member: MemberModel }>();
 const { t } = useI18n();
</script>
<template>
 <span v-if="props.member.isNinja" class="CurrentBelt">
  <span>{{ t('achievementReviews.currentBelt') }}</span>
  <MemberBelt :member="props.member" earnedOnly size="md" class="CurrentBeltValue" />
 </span>
</template>
<style scoped lang="scss">
 .CurrentBelt { display: inline-flex; flex-wrap: wrap; align-items: center; gap: calc(var(--spacing) * 2); font-size: var(--text-xs); color: var(--ui-text-muted); }
 .CurrentBeltValue { width: 5rem; max-width: 100%; }
</style>
