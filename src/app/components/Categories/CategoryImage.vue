<script setup lang="ts">
 import { computed, ref, watch, type ComputedRef, type Ref } from "vue";
 const props = defineProps<{ id: string; name: string; populated: boolean; revision: string | null; size: "sm" | "large"; borderColor?: string | null }>();
 const { BadgeCategoryLogoUrl } = useUiConfig();
 const { t } = useI18n();
 const failed: Ref<boolean> = ref(false);
 const source: ComputedRef<string> = computed((): string => {
  const original: string = BadgeCategoryLogoUrl(props.id);
  return props.revision ? original.replace(/\.jpg$/, `_${props.revision}.png`) : original;
 });
 const outline: ComputedRef<Record<string, string>> = computed((): Record<string, string> => ({ "--image-border-color": props.borderColor ?? "transparent" }));
 watch(source, (): void => { failed.value = false; });
</script>
<template>
 <span class="CategoryImage" :class="`Size_${size}`" :style="outline">
  <img v-if="populated && !failed" :src="source" :alt="name" @error="failed = true" />
  <UIcon v-else name="i-lucide-image" :aria-label="t('profileImages.empty')" />
 </span>
</template>
<style scoped lang="scss">
 .CategoryImage { display:inline-flex; align-items:center; justify-content:center; flex-shrink:0; border:2px solid var(--image-border-color); border-radius:var(--radius); color:var(--ui-text-muted); background:var(--ui-bg-elevated); }
 .Size_sm { width:3rem; height:3rem; } .Size_large { width:min(100%, 16rem); aspect-ratio:1; }
 img { width:100%; height:100%; object-fit:contain; } .CategoryImage :deep(.iconify) { font-size:2rem; }
</style>
