<script setup lang="ts">
	import type { ProfileMode } from "#shared/types/MemberProfile";
	import { useActionNotifications } from "~/composables/useActionNotifications";
	import { requestFailureMessage } from "#shared/utils/RequestFailure";
	import { compareMemberNames } from "#shared/utils/MemberNames";
	import { computed, ref, watch, type ComputedRef, type Ref } from "vue";
	import { memberSearchSchema, relationshipInputSchema, type RelationshipInput } from "#shared/types/MemberMaintenance";
	import type { MemberModel } from "#shared/types/models/MemberModel";
	import type { MemberParentModel } from "#shared/types/models/MemberParentModel";
	const props = withDefaults(defineProps<{ mode?: ProfileMode; member: MemberModel; members: MemberModel[]; relationships: MemberParentModel[]; side: "parents" | "children"; saving: boolean; link: (body: RelationshipInput) => Promise<null>; unlink: (body: RelationshipInput) => Promise<null> }>(), { mode: "view" });
	type RelationshipRow = { member: MemberModel; input: RelationshipInput };
	const { t } = useI18n();
	const { publish } = useActionNotifications();
	const editing: ComputedRef<boolean> = computed((): boolean => props.mode === "edit");
	const search: Ref<string> = ref("");
	const removing: Ref<string | null> = ref(null);
	const limit: Ref<number> = ref(20);

	const linked: ComputedRef<RelationshipRow[]> = computed((): RelationshipRow[] => props.relationships.flatMap((relation: MemberParentModel): RelationshipRow[] => {
		if ((props.side === "parents" ? relation.memberId : relation.parentId) !== props.member.id) return [];
		const target: MemberModel | null = props.members.find((member: MemberModel): boolean => member.id === (props.side === "parents" ? relation.parentId : relation.memberId)) ?? null;
		return target ? [{ member: target, input: { memberId: relation.memberId, parentId: relation.parentId } }] : [];
	}).sort((a: RelationshipRow, b: RelationshipRow): number => compareMemberNames(a.member, b.member)));
	const matches: ComputedRef<MemberModel[]> = computed((): MemberModel[] => {
		const parsed: ReturnType<typeof memberSearchSchema.safeParse> = memberSearchSchema.safeParse(search.value);
		if (!parsed.success || !parsed.data) return [];
		const term: string = parsed.data.toLocaleLowerCase();
		return props.members.filter((member: MemberModel): boolean => member.id !== props.member.id && (props.side === "parents" ? member.isParent : member.isNinja) && !linked.value.some((row: RelationshipRow): boolean => row.member.id === member.id) && `${member.nameFirst ?? ""} ${member.nameLast ?? ""} ${member.login ?? ""}`.toLocaleLowerCase().includes(term)).sort(compareMemberNames);
	});
	const candidates: ComputedRef<MemberModel[]> = computed((): MemberModel[] => matches.value.slice(0, limit.value));
	/** Link or unlink only a validated parent-coder pair through store callbacks. */
	async function change(input: RelationshipInput, remove: boolean): Promise<void> {
		if (!editing.value || props.saving) return;
		try { await (remove ? props.unlink : props.link)(relationshipInputSchema.parse(input)); removing.value = null; search.value = ""; publish({ name: "maintenance.memberrelationships.success", severity: "success", message: t("actionNotifications.saved") }); }
		catch (failure: unknown) { publish({ name: "maintenance.memberrelationships.error", severity: "error", message: requestFailureMessage(failure) ?? t("maintenance.saveError") }); }
	}
	/** Build a pair from either profile's relationship view. */
	function pair(target: MemberModel): RelationshipInput { return props.side === "parents" ? { memberId: props.member.id, parentId: target.id } : { memberId: target.id, parentId: props.member.id }; }
	watch([search, (): string => props.member.id, (): string => props.side], (): void => { limit.value = 20; });
	watch((): ProfileMode => props.mode, (): void => { search.value = ""; removing.value = null; });
</script>
<template>
	<UPageCard :title="t(`maintenance.${side}`)">
		<p v-if="!linked.length">{{ t('maintenance.noRelationships') }}</p>
		<ul class="Relationships"><li v-for="row in linked" :key="row.member.id">
			<NuxtLink :to="`/member/member/${row.member.id}`">{{ row.member.nameFirst }} {{ row.member.nameLast }}</NuxtLink>
			<template v-if="editing"><UButton v-if="removing !== row.member.id" variant="outline" color="error" :disabled="saving" @click="removing = row.member.id">{{ t('maintenance.unlink') }}</UButton><template v-else><span>{{ t('maintenance.confirmUnlink') }}</span><UButton color="error" :loading="saving" @click="change(row.input, true)">{{ t('maintenance.unlink') }}</UButton><UButton variant="ghost" @click="removing = null">{{ t('profile.cancel') }}</UButton></template></template>
		</li></ul>

		<template v-if="editing"><UInput v-model="search" :maxlength="200" :aria-label="t('maintenance.search')" :placeholder="t('maintenance.search')" /><p v-if="search">{{ t('maintenance.membersCount', { count: matches.length }) }}</p><ul class="Relationships"><li v-for="candidate in candidates" :key="candidate.id"><span>{{ candidate.nameFirst }} {{ candidate.nameLast }}</span><UButton :loading="saving" @click="change(pair(candidate), false)">{{ t('maintenance.link') }}</UButton></li></ul><UButton v-if="candidates.length < matches.length" variant="outline" @click="limit += 20">{{ t('maintenance.showMore') }}</UButton></template>

	</UPageCard>
</template>
<style scoped lang="scss">
	.Relationships { list-style: none; padding: 0; display: grid; gap: calc(var(--spacing) * 3); } .Relationships li { display: flex; align-items: center; gap: calc(var(--spacing) * 3); flex-wrap: wrap; }
</style>
