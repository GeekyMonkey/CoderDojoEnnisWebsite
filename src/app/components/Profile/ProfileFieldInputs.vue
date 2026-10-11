<script setup lang="ts">
	import type { MemberProfileFields } from "#shared/types/MemberProfile";
	import { PROFILE_FIELDS } from "./profileFields";
	const props = withDefaults(defineProps<{ fields: MemberProfileFields; disabled?: boolean; pathPrefix?: string }>(), { disabled: false, pathPrefix: "" });
	const { t } = useI18n();
	/** Keep shared profile inputs typed in both signup and edit forms. */
	function update(key: keyof MemberProfileFields, value: string | number): void { props.fields[key] = String(value); }
</script>
<template>
	<div class="ProfileInputs">
		<UFormField v-for="field in PROFILE_FIELDS" :key="field.key" :name="`${pathPrefix}${field.key}`" :label="t(`profile.${field.key}`)">
			<UInput :modelValue="fields[field.key] ?? ''" :type="field.type" :autocomplete="field.autocomplete" :disabled="disabled" class="ProfileInput" @update:modelValue="(value: string | number): void => update(field.key, value)" />
		</UFormField>
	</div>
</template>
<style scoped lang="scss">
	.ProfileInputs { display: grid; grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr)); gap: calc(var(--spacing) * 4); }
	.ProfileInput { width: 100%; }
</style>
