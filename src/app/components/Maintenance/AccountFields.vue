<script setup lang="ts">
	import { computed, type ComputedRef } from "vue";
	import type { AccountFields } from "#shared/types/MemberMaintenance";
	import type { TeamModel } from "#shared/types/models/TeamModel";
	const props = withDefaults(defineProps<{ fields: AccountFields; teams: TeamModel[]; disabled?: boolean; pathPrefix?: string }>(), { disabled: false, pathPrefix: "" });
	type AccountInput = { key: "birthYear" | "fingerprintId" | "login" | "nfcTag"; type: "number" | "text" };
	const INPUTS: AccountInput[] = [{ key: "login", type: "text" }, { key: "fingerprintId", type: "number" }, { key: "nfcTag", type: "text" }, { key: "birthYear", type: "number" }];
	const CHECKS: ("registeredCurrentTerm" | "gardaVetted")[] = ["registeredCurrentTerm", "gardaVetted"];
	const { t } = useI18n();
	const teamItems: ComputedRef<{ label: string; value: string }[]> = computed((): { label: string; value: string }[] => [{ label: t("maintenance.noTeam"), value: "NONE" }, ...props.teams.map((team: TeamModel): { label: string; value: string } => ({ label: team.teamName, value: team.id }))]);
	const visibleInputs: ComputedRef<AccountInput[]> = computed((): AccountInput[] => INPUTS.filter((field: AccountInput): boolean => field.key !== "birthYear" || props.fields.isNinja));
	const visibleChecks: ComputedRef<typeof CHECKS> = computed((): typeof CHECKS => CHECKS.filter((key: typeof CHECKS[number]): boolean => (key !== "registeredCurrentTerm" || props.fields.isNinja) && (key !== "gardaVetted" || props.fields.isMentor)));
	/** Normalize cleared optional numbers and text to null. */
	function update(field: AccountInput, value: string | number): void {
		if (field.key === "birthYear" || field.key === "fingerprintId") props.fields[field.key] = String(value).trim() === "" ? null : Number(value);
		else props.fields[field.key] = String(value) || null;
	}
</script>
<template>
	<div class="AccountInputs">
		<UFormField v-for="field in visibleInputs" :key="field.key" :name="`${pathPrefix}${field.key}`" :label="t(`maintenance.${field.key}`)">
			<UInput :modelValue="String(fields[field.key] ?? '')" :type="field.type" :disabled="disabled" class="AccountInput" @update:modelValue="(value: string | number): void => update(field, value)" />
		</UFormField>
		<UFormField v-if="fields.isNinja" :name="`${pathPrefix}teamId`" :label="t('maintenance.team')">
			<USelect :modelValue="fields.teamId ?? 'NONE'" :items="teamItems" :disabled="disabled" class="AccountInput" @update:modelValue="(value: string): void => { fields.teamId = value === 'NONE' ? null : value; }" />
		</UFormField>
		<MemberRoles :modelValue="fields" mode="edit" :disabled="disabled" :pathPrefix="pathPrefix" @update:modelValue="(value: Pick<AccountFields, 'isNinja' | 'isParent' | 'isMentor'>): void => { Object.assign(fields, value); }" />
		<UFormField v-for="key in visibleChecks" :key="key" :name="`${pathPrefix}${key}`"><UCheckbox v-model="fields[key]" :disabled="disabled" :label="t(`maintenance.${key}`)" /></UFormField>
	</div>
</template>
<style scoped lang="scss">
	.AccountInputs { display: grid; grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr)); gap: calc(var(--spacing) * 4); }
	.AccountInput { width: 100%; }
</style>
