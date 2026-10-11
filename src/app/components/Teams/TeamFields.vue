<script setup lang="ts">
 import type { TeamFields } from "#shared/types/TeamMaintenance";
 const props = defineProps<{ fields: TeamFields; disabled: boolean }>();
 const { t } = useI18n();
 /** Convert cleared optional controls to null without trimming an in-progress draft. */
 function updateOptional(key: "hexcode" | "goal" | "notes", value: string | undefined): void { props.fields[key] = value || null; }
</script>
<template>
 <UFormField name="teamName" :label="t('teams.name')" required><UInput v-model="props.fields.teamName" :disabled="disabled" /></UFormField>
 <UFormField name="hexcode" :label="t('teams.colour')"><div class="ColourInput"><UInput :modelValue="props.fields.hexcode ?? ''" @update:modelValue="updateOptional('hexcode', $event)" placeholder="#RRGGBB" :disabled="disabled" /><TeamColour :hexcode="props.fields.hexcode" /></div></UFormField>
 <UFormField name="goal" :label="t('teams.goal')"><UTextarea :modelValue="props.fields.goal ?? ''" @update:modelValue="updateOptional('goal', $event)" :disabled="disabled" /></UFormField>
 <UFormField name="notes" :label="t('teams.notes')"><UTextarea :modelValue="props.fields.notes ?? ''" @update:modelValue="updateOptional('notes', $event)" :disabled="disabled" /></UFormField>
</template>
<style scoped lang="scss">.ColourInput { display: flex; align-items: center; gap: calc(var(--spacing) * 3); }</style>
