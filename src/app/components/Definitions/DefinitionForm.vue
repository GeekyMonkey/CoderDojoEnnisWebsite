<script setup lang="ts">
 import { useActionNotifications } from "~/composables/useActionNotifications";
 import { computed, type ComputedRef } from "vue";
 import { definitionFieldsSchema, definitionSnapshot, newDefinition, type Definition, type DefinitionFields, type DefinitionKind } from "#shared/types/DefinitionMaintenance";
 import { useSectionDraft } from "~/composables/useSectionDraft";
 import { requestFailureMessage } from "#shared/utils/RequestFailure";
 const props = defineProps<{ kind: DefinitionKind; definition: Definition | null; categories: Definition[]; saving: boolean; save: (fields: DefinitionFields,expected: DefinitionFields | null) => Promise<Definition> }>();
 const emit = defineEmits<{ saved: [definition: Definition]; cancel: [] }>();
 const { t } = useI18n();
 const { publish } = useActionNotifications();

 const { fields,baseline,dirty,remoteChanged,reset } = useSectionDraft((): Definition => props.definition ?? newDefinition(props.kind),definitionSnapshot);
 const schema: ComputedRef<ReturnType<typeof definitionFieldsSchema>> = computed((): ReturnType<typeof definitionFieldsSchema> => definitionFieldsSchema(props.kind));
 /** Validate and save while protecting an unsaved draft from remote changes. */
 async function submit(): Promise<void> {
  if(props.saving || remoteChanged.value) return;
  try { emit("saved",await props.save(schema.value.parse(fields),props.definition ? baseline.value : null)); publish({ name: "definitions.definitionform.success", severity: "success", message: t("actionNotifications.saved") }); }
  catch(failure: unknown) { publish({ name: "definitions.definitionform.error", severity: "error", message: requestFailureMessage(failure) ?? t("definitionMaintenance.saveError") }); }
 }
</script>
<template>
 <UForm :schema="schema" :state="fields" class="DefinitionForm" @submit="submit">
  <DefinitionFields :kind="kind" :fields="fields" :categories="categories" :disabled="saving" />
  <UAlert v-if="remoteChanged" color="warning" :title="t('definitionMaintenance.remoteChanged')" />
  <UButton v-if="remoteChanged" variant="outline" :disabled="saving" @click="reset">{{ t('profile.reload') }}</UButton>

  <div class="DefinitionActions"><UButton type="submit" :loading="saving" :disabled="remoteChanged || (!!definition && !dirty)">{{ t('definitionMaintenance.save') }}</UButton><UButton variant="outline" :disabled="saving" @click="emit('cancel')">{{ t('profile.cancel') }}</UButton></div>
 </UForm>
</template>
<style scoped lang="scss">.DefinitionForm { display:grid; gap:calc(var(--spacing) * 4); } .DefinitionActions { display:flex; gap:calc(var(--spacing) * 3); }</style>
