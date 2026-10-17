<script setup lang="ts">
import { useId } from "vue";
import type { MergeSource } from "#shared/types/MemberMerge";
const props = defineProps<{ field: string; label: string; keep: string; duplicate: string; selected?: MergeSource | null; disabled: boolean }>();
const emit = defineEmits<{ change: [field: string, selected: MergeSource] }>();
const groupId: string = useId();
/** Emit the explicitly selected account source. */
function change(selected: MergeSource): void { emit("change", props.field, selected); }
</script>
<template>
 <fieldset class="MergeFieldChoice" :disabled="disabled">
  <legend>{{ label }}</legend>
  <label><input type="radio" :name="groupId" value="keep" :checked="selected === 'keep'" required @change="change('keep')" /><slot name="keep">{{ keep }}</slot></label>
  <label><input type="radio" :name="groupId" value="duplicate" :checked="selected === 'duplicate'" required @change="change('duplicate')" /><slot name="duplicate">{{ duplicate }}</slot></label>
 </fieldset>
</template>
<style scoped lang="scss">
.MergeFieldChoice { display: grid; gap: calc(var(--spacing) * 3); padding: calc(var(--spacing) * 3); border: 1px solid var(--ui-border); border-radius: var(--ui-radius); min-width: 0; }
legend { font-weight: 600; }
label { display: flex; align-items: baseline; gap: calc(var(--spacing) * 2); overflow-wrap: anywhere; white-space: pre-wrap; }
input { flex-shrink: 0; accent-color: var(--ui-primary); }
</style>
