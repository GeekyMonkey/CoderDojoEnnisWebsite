<script setup lang="ts">
 import { ref, computed, type Ref, type ComputedRef } from "vue";
 import { definitionFieldsSchema, definitionSnapshot, newDefinition, type Definition, type DefinitionFields, type DefinitionKind } from "#shared/types/DefinitionMaintenance";
 import { useSectionDraft } from "~/composables/useSectionDraft";
 import { requestFailureMessage } from "#shared/utils/RequestFailure";
 const props = defineProps<{ kind: DefinitionKind; definition: Definition | null; categories: Definition[]; saving: boolean; save: (fields: DefinitionFields,expected: DefinitionFields | null) => Promise<Definition> }>();
 const emit = defineEmits<{ saved: [definition: Definition]; cancel: [] }>();
 const { t } = useI18n();
 const error: Ref<string | null> = ref(null);
 const { fields,baseline,dirty,remoteChanged,reset } = useSectionDraft((): Definition => props.definition ?? newDefinition(props.kind),definitionSnapshot);
 const schema: ComputedRef<ReturnType<typeof definitionFieldsSchema>> = computed((): ReturnType<typeof definitionFieldsSchema> => definitionFieldsSchema(props.kind));
 /** Validate and save while protecting an unsaved draft from remote changes. */
 async function submit(): Promise<void> {
  if(props.saving || remoteChanged.value) return; error.value = null;
  try { emit("saved",await props.save(schema.value.parse(fields),props.definition ? baseline.value : null)); }
  catch(failure: unknown) { error.value = requestFailureMessage(failure) ?? t("definitionMaintenance.saveError"); }
 }
</script>
<template>
 <UForm :schema="schema" :state="fields" class="DefinitionForm" @submit="submit">
  <DefinitionFields :kind="kind" :fields="fields" :categories="categories" :disabled="saving" />
  <UAlert v-if="remoteChanged" color="warning" :title="t('definitionMaintenance.remoteChanged')" />
  <UButton v-if="remoteChanged" variant="outline" :disabled="saving" @click="reset">{{ t('profile.reload') }}</UButton>
  <UAlert v-if="error" color="error" :title="error" />
  <div class="DefinitionActions"><UButton type="submit" :loading="saving" :disabled="remoteChanged || (!!definition && !dirty)">{{ t('definitionMaintenance.save') }}</UButton><UButton variant="outline" :disabled="saving" @click="emit('cancel')">{{ t('profile.cancel') }}</UButton></div>
 </UForm>
</template>
<style scoped lang="scss">.DefinitionForm { display:grid; gap:calc(var(--spacing) * 4); } .DefinitionActions { display:flex; gap:calc(var(--spacing) * 3); }</style>
