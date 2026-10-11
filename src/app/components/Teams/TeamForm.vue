<script setup lang="ts">
 import { useActionNotifications } from "~/composables/useActionNotifications";
 import { type Ref } from "vue";
 import { newTeam, teamSnapshot, teamFieldsSchema, type TeamFields } from "#shared/types/TeamMaintenance";
 import type { TeamModel } from "#shared/types/models/TeamModel";
 import { useSectionDraft } from "~/composables/useSectionDraft";
 import { requestFailureMessage } from "#shared/utils/RequestFailure";
 const props = defineProps<{ team: TeamModel | null; saving: boolean; save: (fields: TeamFields, expected: TeamFields | null) => Promise<TeamModel> }>();
 const emit = defineEmits<{ saved: [team: TeamModel]; cancel: [] }>();
 const { t } = useI18n();
 const { publish } = useActionNotifications();

 const { fields, baseline, dirty, remoteChanged, reset } = useSectionDraft((): TeamModel => props.team ?? { id: "new", deleted: false, ...newTeam() }, teamSnapshot);
 /** Save validated fields while protecting a dirty draft from remote changes. */
 async function submit(): Promise<void> {
  if (props.saving || remoteChanged.value) return;
  try { emit("saved", await props.save(teamFieldsSchema.parse(fields), props.team ? baseline.value : null)); publish({ name: "teams.teamform.success", severity: "success", message: t("actionNotifications.saved") }); }
  catch (failure: unknown) { publish({ name: "teams.teamform.error", severity: "error", message: requestFailureMessage(failure) ?? t("teams.saveError") }); }
 }
</script>
<template>
 <UForm :schema="teamFieldsSchema" :state="fields" class="TeamForm" @submit="submit">
  <TeamFields :fields="fields" :disabled="saving" />
  <UAlert v-if="remoteChanged" color="warning" :title="t('teams.remoteChanged')" />
  <UButton v-if="remoteChanged" variant="outline" :disabled="saving" @click="reset">{{ t('profile.reload') }}</UButton>

  <div class="TeamActions"><UButton type="submit" :loading="saving" :disabled="remoteChanged || (!!team && !dirty)">{{ t('teams.save') }}</UButton><UButton variant="outline" :disabled="saving" @click="emit('cancel')">{{ t('profile.cancel') }}</UButton></div>
 </UForm>
</template>
<style scoped lang="scss">.TeamForm { display: grid; gap: calc(var(--spacing) * 4); } .TeamActions { display: flex; gap: calc(var(--spacing) * 3); }</style>
