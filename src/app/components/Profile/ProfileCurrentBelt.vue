<script setup lang="ts">
 import BeltColor from "~/components/Belts/BeltColor.vue";
 import { useProfileCurrentBeltStore } from "~/stores/useProfileCurrentBeltStore";

 const props = defineProps<{ memberId: string }>();
 const { t } = useI18n();
 const { data, isPending, isError } = useProfileCurrentBeltStore((): string => props.memberId);
</script>

<template>
 <span class="CurrentBelt">
  <span>{{ t('achievementReviews.currentBelt') }}</span>
  <span v-if="isPending">{{ t('profile.loading') }}</span>
  <span v-else-if="isError">{{ t('achievementReviews.loadError') }}</span>
  <BeltColor v-else :belt="data ?? 'noob'" size="md" />
 </span>
</template>

<style scoped lang="scss">
 .CurrentBelt { display: inline-flex; flex-wrap: wrap; align-items: center; gap: calc(var(--spacing) * 2); font-size: var(--text-xs); color: var(--ui-text-muted); }
</style>
