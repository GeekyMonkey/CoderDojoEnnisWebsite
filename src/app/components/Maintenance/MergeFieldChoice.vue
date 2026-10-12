<script setup lang="ts">
import type { MergeField, MergeChoices } from "#shared/types/MemberMerge";
const props = defineProps<{ field: MergeField; label: string; keep: string; duplicate: string; selected: MergeChoices[MergeField]; disabled: boolean }>();
const emit = defineEmits<{ change: [field: MergeField, selected: MergeChoices[MergeField]] }>();
/** Emit a field source using the closed choice set. */
function change(event: Event): void { const value: string = (event.target as HTMLSelectElement).value; if (value === "keep" || value === "duplicate") emit("change", props.field, value); }
</script>
<template><label class="MergeFieldChoice"><span>{{ label }}</span><select :value="selected" :disabled="disabled" @change="change"><option value="keep">{{ keep }}</option><option value="duplicate">{{ duplicate }}</option></select></label></template>
<style scoped lang="scss">
.MergeFieldChoice { display: grid; grid-template-columns: minmax(8rem, 1fr) minmax(0, 2fr); align-items: center; gap: calc(var(--spacing) * 3); } select { width: 100%; background: var(--ui-bg); border: 1px solid var(--ui-border); border-radius: var(--ui-radius); padding: calc(var(--spacing) * 2); }
@media (max-width: 40rem) { .MergeFieldChoice { grid-template-columns: minmax(0, 1fr); } }
</style>
