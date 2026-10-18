<script setup lang="ts">
 import type { AccountFields } from "#shared/types/MemberMaintenance";
 import type { ProfileMode } from "#shared/types/MemberProfile";

 const props = withDefaults(defineProps<{ modelValue: MemberRoles; mode?: ProfileMode; disabled?: boolean; pathPrefix?: string }>(), { mode: "view", disabled: false, pathPrefix: "" });
 const emit = defineEmits<{ "update:modelValue": [value: MemberRoles] }>();

 type MemberRoles = Pick<AccountFields, "isNinja" | "isParent" | "isMentor">;
 type RoleKey = keyof MemberRoles;
 const ROLE_KEYS: RoleKey[] = ["isNinja", "isParent", "isMentor"];
 const { t } = useI18n();

 /** Emit role edits without allowing display mode to mutate account data. */
 function update(key: RoleKey, value: boolean | "indeterminate"): void {
  if (props.mode !== "edit" || props.disabled) return;
  emit("update:modelValue", { ...props.modelValue, [key]: value === true });
 }
</script>

<template>
 <div v-if="mode === 'view'" class="MemberRoles">
  <strong>{{ t('maintenance.roles') }}</strong>
  <ul class="RoleLabels"><template v-for="key in ROLE_KEYS" :key="key"><li v-if="modelValue[key]">{{ t(`maintenance.${key}`) }}</li></template></ul>
 </div>
 <fieldset v-else class="MemberRoles">
  <legend>{{ t('maintenance.roles') }}</legend>
  <div class="RoleChecks">
   <UFormField v-for="key in ROLE_KEYS" :key="key" :name="`${pathPrefix}${key}`">
    <UCheckbox :modelValue="modelValue[key]" :disabled="mode !== 'edit' || disabled" :label="t(`maintenance.${key}`)" @update:modelValue="(value: boolean | 'indeterminate'): void => update(key, value)" />
   </UFormField>
  </div>
 </fieldset>
</template>

<style scoped lang="scss">
 .RoleLabels { display: flex; flex-wrap: wrap; gap: calc(var(--spacing) * 3); list-style: none; padding: 0; margin: 0; }
 .MemberRoles { border: 0; padding: 0; margin: 0; min-width: 0; }
 .MemberRoles legend { padding: 0; margin-bottom: var(--spacing); font-weight: 600; }
 .RoleChecks { display: grid; gap: var(--spacing); }
</style>
