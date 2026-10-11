<script setup lang="ts">
 import { computed, type ComputedRef, type WritableComputedRef } from "vue";
 import type { Definition, DefinitionFields, DefinitionKind } from "#shared/types/DefinitionMaintenance";
 const props = defineProps<{ kind: DefinitionKind; fields: DefinitionFields; categories: Definition[]; disabled: boolean }>();
 const { t } = useI18n();
 const options: ComputedRef<{ label: string; value: string }[]> = computed((): { label: string; value: string }[] => [{ label:t("definitionMaintenance.selectCategory"),value:"NONE" },...props.categories.map((category: Definition): { label: string; value: string } => ({ label:category.name,value:category.id }))]);
 const category: WritableComputedRef<string> = computed({ get: (): string => props.fields.categoryId ?? "NONE", set: (value: string): void => { props.fields.categoryId = value === "NONE" ? null : value; } });
 /** Normalize cleared optional controls to null while preserving the current draft. */
 function updateText(key: "description" | "hexCode",value: string | undefined): void { props.fields[key] = value || null; }
 /** Keep cleared sort order unavailable and validate numeric input on submission. */
 function updateOrder(value: string | number | null | undefined): void { props.fields.sortOrder = value === "" || value === null || value === undefined ? null : Number(value); }
</script>
<template>
 <UFormField name="name" :label="t(kind === 'badge' ? 'definitionMaintenance.achievement' : 'definitionMaintenance.name')" required><UInput v-model="props.fields.name" :disabled="disabled" maxlength="150" /></UFormField>
 <template v-if="kind === 'belt'">
  <UFormField name="hexCode" :label="t('teams.colour')"><div class="ColourInput"><UInput :modelValue="fields.hexCode ?? ''" placeholder="#RRGGBB" :disabled="disabled" @update:modelValue="updateText('hexCode',$event)" /><ColourSwatch :hexCode="fields.hexCode" /></div></UFormField>
  <UFormField name="sortOrder" :label="t('definitionMaintenance.sortOrder')" required><UInput type="number" :modelValue="fields.sortOrder === null ? '' : String(fields.sortOrder)" :disabled="disabled" @update:modelValue="updateOrder" /></UFormField>
 </template>
 <UFormField v-if="kind === 'badge'" name="categoryId" :label="t('definitionMaintenance.category')" required><USelect v-model="category" :items="options" :disabled="disabled" /></UFormField>
 <UFormField name="description" :label="t('definitionMaintenance.description')"><UTextarea :modelValue="fields.description ?? ''" :disabled="disabled" maxlength="4000" @update:modelValue="updateText('description',$event)" /></UFormField>
</template>
<style scoped lang="scss">.ColourInput { display:flex; align-items:center; gap:calc(var(--spacing) * 3); }</style>
