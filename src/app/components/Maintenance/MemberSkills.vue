<script setup lang="ts">
	import type { ProfileMode } from "#shared/types/MemberProfile";
	import { useActionNotifications } from "~/composables/useActionNotifications";
	import { requestFailureMessage } from "#shared/utils/RequestFailure";
	import { computed, ref, type ComputedRef, type Ref } from "vue";
	import { skillInputSchema, type SkillInput } from "#shared/types/MemberMaintenance";
	import type { BadgeCategoryModel } from "#shared/types/models/BadgeCategoryModel";
	import type { MemberBadgeCategoryModel } from "#shared/types/models/MemberBadgeCategoryModel";
	const props = withDefaults(defineProps<{ mode?: ProfileMode; memberId: string; categories: BadgeCategoryModel[]; skills: MemberBadgeCategoryModel[]; saving: boolean; addSkill: (body: SkillInput) => Promise<null>; removeSkill: (body: SkillInput) => Promise<null> }>(), { mode: "view" });
	type SkillRow = { id: string; name: string; selected: boolean };
	const { t } = useI18n();
	const { publish } = useActionNotifications();
	const changing: Ref<boolean> = ref(false);
	const editing: ComputedRef<boolean> = computed((): boolean => props.mode === "edit");

	const rows: ComputedRef<SkillRow[]> = computed((): SkillRow[] => props.categories.map((category: BadgeCategoryModel): SkillRow => ({ id: category.id, name: category.categoryName ?? "—", selected: props.skills.some((skill: MemberBadgeCategoryModel): boolean => skill.memberId === props.memberId && skill.badgeCategoryId === category.id) })).filter((row: SkillRow): boolean => editing.value || row.selected));
	/** Save one independent skill assignment without replacing other concurrent assignments. */
	async function change(row: SkillRow, selected: boolean | "indeterminate"): Promise<void> {
		if (!editing.value || props.saving || changing.value || selected === "indeterminate" || selected === row.selected) return;
		changing.value = true;
		try { await (selected ? props.addSkill : props.removeSkill)(skillInputSchema.parse({ memberId: props.memberId, badgeCategoryId: row.id })); publish({ name: "maintenance.memberskills.success", severity: "success", message: t("actionNotifications.saved") }); }
		catch (failure: unknown) { publish({ name: "maintenance.memberskills.error", severity: "error", message: requestFailureMessage(failure) ?? t("maintenance.saveError") }); }
		finally { changing.value = false; }
	}
</script>
<template>
	<UPageCard :title="t('maintenance.skills')">
		<p v-if="!rows.length">{{ t('maintenance.noSkills') }}</p>
		<ul class="Skills"><li v-for="row in rows" :key="row.id"><UCheckbox v-if="editing" :modelValue="row.selected" :label="row.name" :disabled="saving || changing" @update:modelValue="(value: boolean | 'indeterminate'): void => { void change(row, value); }" /><span v-else>{{ row.name }}</span></li></ul>

	</UPageCard>
</template>
<style scoped lang="scss">
	.Skills { list-style: none; padding: 0; display: grid; gap: calc(var(--spacing) * 3); } .Skills li { display: flex; align-items: center; gap: calc(var(--spacing) * 3); }
</style>
