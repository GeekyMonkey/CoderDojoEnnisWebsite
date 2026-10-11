<script setup lang="ts">
	import { computed, type ComputedRef } from "vue";
	import type { MemberProfileFields } from "#shared/types/MemberProfile";
	import { PROFILE_FIELDS, type ProfileField } from "./profileFields";
	const props = withDefaults(defineProps<{ fields: MemberProfileFields & { login?: string }; includeLogin?: boolean; disabled?: boolean; pathPrefix?: string }>(), { includeLogin: false, disabled: false, pathPrefix: "" });
	const { t } = useI18n();
	const inputFields: ComputedRef<(ProfileField | { key: "login"; autocomplete: "username"; type: "text" })[]> = computed((): (ProfileField | { key: "login"; autocomplete: "username"; type: "text" })[] => props.includeLogin ? [{ key: "login", autocomplete: "username", type: "text" }, ...PROFILE_FIELDS] : PROFILE_FIELDS);
	/** Keep shared profile inputs typed in both signup and edit forms. */
	function update(key: keyof MemberProfileFields | "login", value: string | number): void { props.fields[key] = String(value); }
</script>
<template>
	<div class="ProfileInputs">
		<UFormField v-for="field in inputFields" :key="field.key" :name="`${pathPrefix}${field.key}`" :label="t(`profile.${field.key}`)">
			<UInput :modelValue="fields[field.key] ?? ''" :type="field.type" :autocomplete="field.autocomplete" :disabled="disabled" class="ProfileInput" @update:modelValue="(value: string | number): void => update(field.key, value)" />
		</UFormField>
	</div>
</template>
<style scoped lang="scss">
	.ProfileInputs { display: grid; grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr)); gap: calc(var(--spacing) * 4); }
	.ProfileInput { width: 100%; }
</style>
