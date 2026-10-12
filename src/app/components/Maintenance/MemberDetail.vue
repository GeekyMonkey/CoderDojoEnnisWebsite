<script setup lang="ts">
	import AchievementsReviewList from "~/components/Achievements/ReviewList.vue";
	import { computed, type ComputedRef } from "vue";
	import type { AccountFields, GoalFields, GuardedUpdate, PasswordReset } from "#shared/types/MemberMaintenance";
	import type { MemberModel } from "#shared/types/models/MemberModel";
	import { profileIdentitySchema } from "#shared/types/MemberProfile";
	import { useMemberMaintenanceStore } from "~/stores/useMemberMaintenanceStore";
	const props = defineProps<{ memberId: string }>();
	const { t } = useI18n();
	const store: ReturnType<typeof useMemberMaintenanceStore> = useMemberMaintenanceStore();
	const { data, isPending, isError, isSaving } = store;
	const valid: ComputedRef<boolean> = computed((): boolean => profileIdentitySchema.safeParse(props.memberId).success);
	const member: ComputedRef<MemberModel | null> = computed((): MemberModel | null => store.membersById.value[props.memberId] ?? null);
	const title: ComputedRef<string> = computed((): string => member.value ? `${member.value.nameFirst ?? ""} ${member.value.nameLast ?? ""}`.trim() : t("maintenance.member"));
	const directory: ComputedRef<{ label: string; to: string }> = computed((): { label: string; to: string } => member.value?.isNinja ? { label: t("nav.Members"), to: "/mentor/members" } : member.value?.isParent ? { label: t("nav.Parents"), to: "/mentor/parents" } : { label: t("nav.Mentors"), to: "/mentor/mentors" });
	/** Delegate account changes to the maintenance store. */
	async function saveAccount(body: GuardedUpdate<AccountFields>): Promise<MemberModel> { return store.saveAccount(props.memberId, body); }
	/** Delegate goal changes to the maintenance store. */
	async function saveGoals(body: GuardedUpdate<GoalFields>): Promise<MemberModel> { return store.saveGoals(props.memberId, body); }
	/** Delegate selected-member password resets to the maintenance store. */
	async function resetPassword(body: PasswordReset): Promise<null> { return store.resetPassword(props.memberId, body); }
</script>
<template>
	<UDashboardPanel id="mentor-member-detail">
		<template #header><DashboardHeading :pageTitle="title" :breadcrumbLabel="directory.label" :breadcrumbTo="directory.to" /></template>
		<template #body><div class="MemberDetail">
			<p v-if="isPending">{{ t('profile.loading') }}</p><UAlert v-else-if="isError" color="error" :title="t('profile.loadError')" /><UAlert v-else-if="!valid || !member" color="error" :title="t('maintenance.notFound')" />
			<template v-else-if="member && data">
				<div class="MemberActions"><UButton :to="`/mentor/maintenance/print?kind=member&memberId=${memberId}`" target="_blank" variant="outline">{{ t('printing.id') }}</UButton><UButton v-if="member.isNinja" :to="`/mentor/maintenance/print?kind=certificate&memberId=${memberId}`" target="_blank" variant="outline">{{ t('printing.certificate') }}</UButton><UButton :to="`/mentor/maintenance/merge/${memberId}`" variant="outline">{{ t('accountMerge.title') }}</UButton></div><UserProfile :key="memberId" :memberId="memberId" />
				<MemberAccount :key="`account-${memberId}`" :member="member" :teams="data.teams" :saving="isSaving" :save="saveAccount" />
				<PasswordResetForm :key="`password-${memberId}`" :saving="isSaving" :resetPassword="resetPassword" />
				<template v-if="member.isNinja"><MemberGoals :key="`goals-${memberId}`" :member="member" :saving="isSaving" :save="saveGoals" /><MemberRelationships :key="`parents-${memberId}`" :member="member" :members="data.members" :relationships="data.relationships" side="parents" :saving="isSaving" :link="store.link" :unlink="store.unlink" /><MemberAttendanceHistory :key="`attendance-${memberId}`" :memberId="memberId" /><UPageCard><AchievementsReviewList :key="`belts-${memberId}`" kind="belt" :memberId="memberId" /><AchievementsReviewList :key="`badges-${memberId}`" kind="badge" :memberId="memberId" /></UPageCard></template>
				<MemberRelationships v-if="member.isParent" :key="`children-${memberId}`" :member="member" :members="data.members" :relationships="data.relationships" side="children" :saving="isSaving" :link="store.link" :unlink="store.unlink" />
				<MemberSkills v-if="member.isMentor" :key="`skills-${memberId}`" :memberId="memberId" :categories="data.categories" :skills="data.skills" :saving="isSaving" :addSkill="store.addSkill" :removeSkill="store.removeSkill" />
			</template>
		</div></template>
	</UDashboardPanel>
</template>
<style scoped lang="scss">
	.MemberActions { display: flex; flex-wrap: wrap; gap: calc(var(--spacing) * 3); }
	.MemberDetail { display: grid; gap: calc(var(--spacing) * 6); padding: calc(var(--spacing) * 4); max-width: 70rem; }
</style>
