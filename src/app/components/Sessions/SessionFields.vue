<script setup lang="ts">
 import type { SessionSnapshot } from "#shared/types/SessionMaintenance";
 import type { SessionHost } from "#shared/types/CoderSession";
 import HostSelect from "./HostSelect.vue";
 const props = defineProps<{ fields: SessionSnapshot; hosts: SessionHost[]; disabled: boolean }>();
 const { t } = useI18n();
</script>
<template>
 <div class="SessionFields">
  <UFormField name="topic" :label="t('sessions.topic')"><UInput :modelValue="fields.topic ?? ''" @update:modelValue="(value: string): void => { fields.topic = value; }" :disabled="disabled" class="PodInput" /></UFormField>
  <UFormField name="url" :label="t('sessions.url')"><UInput :modelValue="fields.url ?? ''" :disabled="disabled" class="PodInput" @update:modelValue="(value: string): void => { fields.url = value || null; }" /></UFormField>
  <UFormField name="hostId" :label="t('sessions.primaryHost')"><HostSelect v-model="fields.hostId" :hosts="hosts" :disabled="disabled" /></UFormField>
  <UFormField name="host2Id" :label="t('sessions.secondHost')"><HostSelect v-model="fields.host2Id" :hosts="hosts" :disabled="disabled" optional /></UFormField>
  <UFormField name="mentorsOnly"><UCheckbox v-model="fields.mentorsOnly" :disabled="disabled" :label="t('sessions.mentorsOnly')" /></UFormField>
 </div>
</template>
<style scoped lang="scss">.SessionFields { display: grid; gap: calc(var(--spacing) * 4); } .PodInput { width: 100%; }</style>
