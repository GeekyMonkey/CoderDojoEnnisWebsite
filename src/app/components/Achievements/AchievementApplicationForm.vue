<script setup lang="ts">
 import { computed, reactive, type ComputedRef } from "vue";
 import { applicationEvidenceSchema } from "#shared/types/Coder";
 import { useActionNotifications } from "~/composables/useActionNotifications";
 import { requestFailureMessage } from "#shared/utils/RequestFailure";
 const props = defineProps<{saving:boolean;apply:(notes:string)=>Promise<unknown>}>();
 const {t} = useI18n();
 const {publish} = useActionNotifications();
 const fields:{notes:string} = reactive({notes:""});
 const valid:ComputedRef<boolean> = computed(():boolean=>applicationEvidenceSchema.safeParse(fields).success);
 /** Validate evidence before submitting through the supplied store action. */
 async function submit():Promise<void> {
  if (props.saving) return;
  try {const body:ReturnType<typeof applicationEvidenceSchema.parse> = applicationEvidenceSchema.parse(fields);await props.apply(body.notes);fields.notes="";publish({name:"coder.application.saved",severity:"success",message:t("coder.applicationSaved")});}
  catch(error:unknown){publish({name:"coder.application.error",severity:"error",message:requestFailureMessage(error)??t("profile.saveError")});}
 }
</script>
<template><UForm :schema="applicationEvidenceSchema" :state="fields" class="ApplicationForm" @submit="submit"><UFormField class="ApplicationField" name="notes" :label="t('coder.evidence')" required><UTextarea v-model="fields.notes" :disabled="saving" :maxlength="4000" class="EvidenceInput" /></UFormField><UButton type="submit" :loading="saving" :disabled="!valid || saving">{{ t('coder.apply') }}</UButton></UForm></template>
<style scoped lang="scss">.ApplicationForm { display:grid; gap:calc(var(--spacing)*3); justify-items:start; } .ApplicationField,.EvidenceInput { width:100%; } .ApplicationForm :deep([data-slot='root']) { max-width:100%; }</style>
