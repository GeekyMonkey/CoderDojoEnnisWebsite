<script setup lang="ts">
 import { ref, type Ref } from "vue";
 const props = defineProps<{ label: string; disabled?: boolean; round?: boolean }>();
 const emit = defineEmits<{ file: [file: File] }>();
 const input: Ref<HTMLInputElement | null> = ref(null);
 const dragging: Ref<boolean> = ref(false);
 /** Forward the selected file through the same flow as a dropped image. */
 function selected(event: Event): void {
  const target: HTMLInputElement = event.target as HTMLInputElement;
  const file: File | null = target.files?.[0] ?? null; target.value = "";
  if (file && !props.disabled) emit("file", file);
 }
 /** Accept one drop without navigating away from the current form. */
 function dropped(event: DragEvent): void {
  dragging.value = false;
  const file: File | null = event.dataTransfer?.files[0] ?? null;
  if (file && !props.disabled) emit("file", file);
 }
</script>
<template>
	<div class="ImageFileTarget">
	<button type="button" :disabled="disabled" :aria-label="label" :class="['ImageTarget', { Round: round, Dragging: dragging }]" @click="input?.click()" @dragover.prevent="dragging = !disabled" @dragleave="dragging = false" @drop.prevent="dropped">
	<slot />
	</button>
	<input ref="input" class="FileInput" type="file" accept="image/jpeg,image/png,image/webp" tabindex="-1" :disabled="disabled" :aria-label="label" @change="selected" />
	</div>
	</template>
<style scoped lang="scss">
 .ImageTarget { width: 100%; aspect-ratio: 1; padding: 0; display: grid; place-items: center; border: 1px solid var(--ui-border); overflow: hidden; cursor: pointer; background: var(--ui-bg-accented); }
 .Round { border-radius: 50%; } .Dragging, .ImageTarget:focus-visible { outline: 2px solid var(--ui-primary); outline-offset: 3px; } .ImageTarget:disabled { cursor: default; } .FileInput { display: none; }
</style>
