<script setup lang="ts">
	import { useMyProfileStore } from "~/stores/useMyProfileStore";
	import MemberDetail from "~/components/Maintenance/MemberDetail.vue";
	import ChildProfile from "~/components/Parent/ChildProfile.vue";
	const props = defineProps<{ memberId: string }>();
	const { t } = useI18n();
	const { profile, isPending, isError } = useMyProfileStore();
</script>

<template>
	<MyProfilePage v-if="profile?.id === memberId" initialMode="view" />
	<MemberDetail v-else-if="profile?.isMentor" :memberId="memberId" />
	<ChildProfile v-else-if="profile?.isParent" :memberId="memberId" />
	<UDashboardPanel v-else id="profile-unavailable">
		<template #header><DashboardHeading :pageTitle="t('profile.details')" /></template>
		<template #body><p v-if="isPending">{{ t('profile.loading') }}</p><UAlert v-else color="error" :title="t(isError ? 'profile.loadError' : 'maintenance.notFound')" /></template>
	</UDashboardPanel>
</template>
