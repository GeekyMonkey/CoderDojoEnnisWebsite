<script setup lang="ts">
	import { computed, ref, type ComputedRef, type Ref } from "vue";
	import { profileIdentitySchema, type ProfileMode } from "#shared/types/MemberProfile";
	import { useParentChildStore } from "~/stores/useParentStore";
	import { useParentChildActionsStore } from "~/stores/useParentChildActionsStore";
	import PublicProfileDetails from "~/components/Profile/PublicProfileDetails.vue";
	import ChildAccountForm from "~/components/Profile/ChildAccountForm.vue";
	import MemberAttendanceHistory from "~/components/Maintenance/MemberAttendanceHistory.vue";
	import ChildAchievementList from "~/components/Achievements/ChildAchievementList.vue";
	import GoalsDisplay from "~/components/Profile/GoalsDisplay.vue";
	import TeamRoster from "~/components/Teams/TeamRoster.vue";
	import ParentContacts from "./ParentContacts.vue";
	const props = defineProps<{ memberId: string }>();
	type ProfileTab = { label: string; value: string; slot: string };
	const { t } = useI18n();
	const route: ReturnType<typeof useRoute> = useRoute();
	const { data, isPending, isError } = useParentChildStore((): string => props.memberId);
	const actions: ReturnType<typeof useParentChildActionsStore> = useParentChildActionsStore((): string => props.memberId);
	const mode: Ref<ProfileMode> = ref("view");
	const tab: Ref<string | number> = ref(typeof route.query.tab === "string" && ["parents", "badges", "belts", "goals", "attendance"].includes(route.query.tab) ? route.query.tab : "details");
	const valid: ComputedRef<boolean> = computed((): boolean => profileIdentitySchema.safeParse(props.memberId).success);
	const tabs: ComputedRef<ProfileTab[]> = computed((): ProfileTab[] => [
		{ label: t("profile.details"), value: "details", slot: "details" },
		...["parents", "badges", "belts", "goals", "attendance"].map((key: string): ProfileTab => ({ label: t(`parent.${key}`), value: key, slot: key })),
	]);
</script>

<template>
	<UDashboardPanel id="linked-child-profile">
		<template #header><DashboardHeading :pageTitle="`${data?.member.nameFirst ?? ''} ${data?.member.nameLast ?? ''}`" :breadcrumbLabel="t('nav.My Kids')" breadcrumbTo="/parent/kids" /></template>
		<template #body>
			<div class="ChildProfile">
				<UAlert v-if="!valid || isError" color="error" :title="t('profile.loadError')" />
				<p v-else-if="isPending">{{ t('profile.loading') }}</p>
				<template v-else-if="data">
					<div class="ProfileActions">
						<UButton v-if="mode === 'view'" @click="mode = 'edit'">{{ t('profile.edit') }}</UButton>
						<UButton v-else variant="outline" :disabled="actions.isSaving.value || actions.isSavingImages.value || actions.isResetting.value" @click="mode = 'view'">{{ t('maintenance.done') }}</UButton>
						<UButton :to="`/parent/showcase?memberId=${memberId}`" variant="outline">{{ t('nav.Showcase') }}</UButton>
						<UButton :to="`/parent/kids/${memberId}/passport`" icon="i-lucide-printer" variant="outline">{{ t('printing.id') }}</UButton>
					</div>
					<UTabs v-model="tab" :items="tabs" :unmountOnHide="false" class="ProfileTabs">
						<template #details>
							<div class="ProfileSection">
								<PublicProfileDetails :member="data.member" :currentBelt="data.currentBelt" :showImages="false" />
								<ProfileImages :member="data.member" :canEdit="mode === 'edit'" :saving="actions.isSavingImages.value" :changeImages="actions.changeImages" />
								<ChildAccountForm v-if="mode === 'edit'" :member="data.member" :mode="mode" :saving="actions.isSaving.value" :save="actions.save" @cancel="mode = 'view'" />
								<ProfilePasswordDialog v-if="mode === 'edit'" :saving="actions.isResetting.value" :resetPassword="actions.resetPassword" />
								<TeamRoster :team="data.team" :members="data.roster" profileBase="/parent/team-members" />
							</div>
						</template>
						<template #parents><ParentContacts :parents="data.parents" /></template>
						<template #badges><ChildAchievementList :memberId="memberId" kind="badge" mode="all" /></template>
						<template #belts><ChildAchievementList :memberId="memberId" kind="belt" mode="all" /></template>
						<template #goals><div class="ProfileSection"><GoalsDisplay :member="data.member" /><ChildAchievementList :memberId="memberId" kind="belt" mode="goals" /><ChildAchievementList :memberId="memberId" kind="badge" mode="goals" /></div></template>
						<template #attendance><MemberAttendanceHistory :memberId="memberId" parent /></template>
					</UTabs>
				</template>
			</div>
		</template>
	</UDashboardPanel>
</template>

<style scoped lang="scss">
	.ChildProfile, .ProfileSection { display: grid; gap: calc(var(--spacing) * 5); min-width: 0; }
	.ChildProfile { padding: calc(var(--spacing) * 4); max-width: 60rem; }
	.ProfileActions { display: flex; flex-wrap: wrap; gap: calc(var(--spacing) * 3); }
	.ProfileTabs { min-width: 0; }
	.ProfileTabs :deep([role="tablist"]) { flex-wrap: wrap; }
</style>
