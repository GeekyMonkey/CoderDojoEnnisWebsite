<script setup lang="ts">
 import { computed, type ComputedRef } from "vue";
 import type { SessionHost } from "#shared/types/CoderSession";
 const props = defineProps<{ modelValue: string | null; hosts: SessionHost[]; optional?: boolean; disabled: boolean }>();
 const emit = defineEmits<{ "update:modelValue": [value: string | null] }>();
 type HostOption = { label: string; value: string; disabled?: boolean };
 const { t } = useI18n();
 const options: ComputedRef<HostOption[]> = computed((): HostOption[] => {
  const values: HostOption[] = props.hosts.map((host: SessionHost): HostOption => ({ label: `${host.nameFirst ?? ""} ${host.nameLast ?? ""}`.trim(), value: host.id }));
  if (props.optional) values.unshift({ label: t("sessions.noSecondHost"), value: "" });
  if (props.modelValue && !props.hosts.some((host: SessionHost): boolean => host.id === props.modelValue)) values.unshift({ label: t("sessions.unavailableHost"), value: props.modelValue, disabled: true });
  return values;
 });
 /** Normalize the optional selector's empty value into null. */
 function select(value: string): void { emit("update:modelValue", value || null); }
</script>
<template><USelect :items="options" :modelValue="modelValue ?? ''" :disabled="disabled" class="HostSelect" @update:modelValue="select" /></template>
<style scoped lang="scss">.HostSelect { width: 100%; }</style>
