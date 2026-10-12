<script setup lang="ts">
	import { useMemberPresenceStore } from "~/stores/useMemberPresenceStore";
	import MemberCurrentBelt from "~/components/Members/MemberCurrentBelt.vue";
	import { computed, reactive, ref, type ComputedRef, type Ref } from "vue";
	import { directoryFilterSchema, type MemberRole } from "#shared/types/MemberMaintenance";
	import type { TeamModel } from "#shared/types/models/TeamModel";
	import type { MemberModel } from "#shared/types/models/MemberModel";
	import { useMemberMaintenanceStore } from "~/stores/useMemberMaintenanceStore";
	const props = defineProps<{ role: MemberRole }>();
	const { t } = useI18n();
	const { presentById } = useMemberPresenceStore();
	const { pageTitle } = useMemberLayoutContext();
	const store: ReturnType<typeof useMemberMaintenanceStore> = useMemberMaintenanceStore();
	const { data, isPending, isError, isSaving } = store;
	const signup: Ref<boolean> = ref(false);
	const limit: Ref<number> = ref(50);
	const filters: { search: string; registeredOnly: boolean } = reactive({ search: "", registeredOnly: false });
	const roleKey: ComputedRef<"isNinja" | "isParent" | "isMentor"> = computed((): "isNinja" | "isParent" | "isMentor" => props.role === "coder" ? "isNinja" : props.role === "parent" ? "isParent" : "isMentor");
	const filtered: ComputedRef<MemberModel[]> = computed((): MemberModel[] => {
		const parsed: ReturnType<typeof directoryFilterSchema.safeParse> = directoryFilterSchema.safeParse(filters);
		if (!parsed.success) return [];
		const search: string = parsed.data.search.toLocaleLowerCase();
		return (data.value?.members ?? []).filter((member: MemberModel): boolean => member[roleKey.value] && (!parsed.data.registeredOnly || member.registeredCurrentTerm) && `${member.nameFirst ?? ""} ${member.nameLast ?? ""} ${member.login ?? ""} ${member.email ?? ""} ${member.phone ?? ""} ${member.fingerprintId ?? ""}`.toLocaleLowerCase().includes(search));
	});
	const visible: ComputedRef<MemberModel[]> = computed((): MemberModel[] => filtered.value.slice(0, limit.value));
	const teamNames: ComputedRef<Record<string, string>> = computed((): Record<string, string> => Object.fromEntries((data.value?.teams ?? []).map((team: TeamModel): [string, string] => [team.id, team.teamName])));
	/** Open the new member's reusable detail page after signup. */
	async function created(member: MemberModel): Promise<void> { signup.value = false; await navigateTo(`/mentor/member/${member.id}`); }
</script>
<template>
	<UDashboardPanel :id="`mentor-${role}-directory`">
		<template #header><DashboardHeading :pageTitle="pageTitle" /></template>
		<template #body><div class="Directory">
			<p v-if="isPending">{{ t('profile.loading') }}</p><UAlert v-else-if="isError" color="error" :title="t('profile.loadError')" />
			<template v-else-if="data">
				<MemberSignup v-if="signup" :role="role" :teams="data.teams" :saving="isSaving" :create="store.create" @created="created" @cancel="signup = false" />
				<template v-else>
					<div class="DirectoryControls"><UInput v-model="filters.search" :maxlength="200" :aria-label="t('maintenance.search')" :placeholder="t('maintenance.search')" /><UCheckbox v-if="role === 'coder'" v-model="filters.registeredOnly" :label="t('maintenance.registeredOnly')" /><UButton v-if="role !== 'parent'" :to="`/mentor/maintenance/print?kind=${role === 'coder' ? 'coders' : 'mentors'}`" target="_blank" variant="outline">{{ t(role === 'coder' ? 'printing.registeredIds' : 'printing.mentorIds') }}</UButton><UButton @click="signup = true">{{ t('maintenance.signup') }}</UButton></div>
					<MemberPresenceLegend v-if="role === 'coder'" /><p>{{ t('maintenance.membersCount', { count: filtered.length }) }}</p><p v-if="!filtered.length">{{ t('maintenance.noMembers') }}</p>
					<ul class="DirectoryMembers"><li v-for="member in visible" :key="member.id">
						<NuxtLink class="DirectoryMember" :to="`/mentor/member/${member.id}`"><MemberPresencePhoto v-if="role === 'coder'" :member="member" :present="presentById === null ? null : presentById[member.id] === true" size="sm" /><MemberAvatar v-else :member="member" size="sm" linkTo="NONE" /><span>{{ member.nameFirst }} {{ member.nameLast }}<small>{{ member.login || '—' }} · {{ teamNames[member.teamId ?? ''] ?? t('maintenance.noTeam') }}</small></span></NuxtLink>
						<MemberCurrentBelt :member="member" /><TeamLogo v-if="member.teamId" :for="member" size="sm" /><span v-if="role !== 'coder'">{{ member.email || member.phone || '—' }}</span><UBadge v-if="member.registeredCurrentTerm" variant="soft">{{ t('maintenance.registeredCurrentTerm') }}</UBadge>
					</li></ul><UButton v-if="visible.length < filtered.length" variant="outline" @click="limit += 50">{{ t('maintenance.showMore') }}</UButton>
				</template>
			</template>
		</div></template>
	</UDashboardPanel>
</template>
<style scoped lang="scss">
	.Directory { padding: calc(var(--spacing) * 4); display: grid; gap: calc(var(--spacing) * 4); }
	.DirectoryControls { display: flex; align-items: center; flex-wrap: wrap; gap: calc(var(--spacing) * 4); }
	.DirectoryMembers { list-style: none; padding: 0; margin: 0; display: grid; gap: calc(var(--spacing) * 3); }
	.DirectoryMembers li { display: flex; align-items: center; flex-wrap: wrap; gap: calc(var(--spacing) * 4); border-bottom: 1px solid var(--ui-border); padding: calc(var(--spacing) * 3); }
	.DirectoryMember { display: flex; align-items: center; gap: calc(var(--spacing) * 3); min-width: 15rem; } .DirectoryMember small { display: block; color: var(--ui-text-muted); }
</style>
