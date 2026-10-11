<script setup lang="ts">
	import { ref, type Ref } from "vue";
	import type { ProfileMode } from "#shared/types/MemberProfile";
	import { useMyProfileStore } from "~/stores/useMyProfileStore";

	const { t } = useI18n();
	const { pageTitle } = useMemberLayoutContext();
	const { permissions, profile, isPending, isError, isSaving, isChangingPassword, save, changePassword } = useMyProfileStore();
	const mode: Ref<ProfileMode> = ref("view");
</script>

<template>
	<UDashboardPanel id="my-profile">
		<template #header><DashboardHeading :pageTitle="pageTitle || t('profile.title')" /></template>
		<template #body>
			<div class="MyProfile">
				<p v-if="isPending">{{ t("profile.loading") }}</p>
				<UAlert v-else-if="isError" color="error" :title="t('profile.loadError')" />
				<template v-else-if="profile">
					<slot name="details" :member="profile" :permissions="permissions">
					<ProfileDetails :member="profile" :mode="mode" :canEdit="permissions?.editDetails ?? false" :saving="isSaving" :save="save" @edit="mode = 'edit'" @cancel="mode = 'view'" @saved="mode = 'view'" />
					</slot>
					<ProfilePasswordForm v-if="mode === 'edit' && permissions?.changePassword" :changePassword="changePassword" :saving="isChangingPassword" />
					<slot name="roleDetails" :member="profile" :permissions="permissions" />
				</template>
			</div>
		</template>
	</UDashboardPanel>
</template>

<style scoped lang="scss">
	.MyProfile { display: grid; gap: calc(var(--spacing) * 6); padding: calc(var(--spacing) * 4); max-width: 60rem; }
</style>
