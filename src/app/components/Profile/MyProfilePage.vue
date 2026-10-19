<script setup lang="ts">
	import { ref, type Ref } from "vue";
	import type { ProfileMode } from "#shared/types/MemberProfile";
	import MentorProfileSections from "./MentorProfileSections.vue";
	import { useMyProfileStore } from "~/stores/useMyProfileStore";

	const props = withDefaults(defineProps<{ initialMode?: ProfileMode }>(), { initialMode: "edit" });
	const { t } = useI18n();
	const { pageTitle } = useMemberLayoutContext();
	const { permissions, profile, isPending, isError, isSaving, isSavingImages, changeImages, isChangingPassword, save, changePassword } = useMyProfileStore();
	const mode: Ref<ProfileMode> = ref(props.initialMode);
</script>

<template>
	<UDashboardPanel id="my-profile">
		<template #header><DashboardHeading :pageTitle="pageTitle || t('profile.title')" /></template>
		<template #body>
			<div class="MyProfile">
				<p v-if="isPending">{{ t("profile.loading") }}</p>
				<UAlert v-else-if="isError" color="error" :title="t('profile.loadError')" />
				<template v-else-if="profile">
					<UButton v-if="mode === 'view' && permissions?.editDetails" class="ProfileEditAction" @click="mode = 'edit'">{{ t("profile.edit") }}</UButton>
					<slot name="details" :member="profile" :permissions="permissions" :mode="mode">
					<ProfileDetails :member="profile" :mode="mode" :canEdit="permissions?.editDetails ?? false" :saving="isSaving || isSavingImages || isChangingPassword" :save="save" :savingImages="isSavingImages" :changeImages="changeImages" @cancel="mode = 'view'" />
					</slot>
					<MentorProfileSections v-if="profile.isMentor" :memberId="profile.id" :mode="mode" @cancel="mode = 'view'" />
					<ProfilePasswordDialog v-if="mode === 'edit' && permissions?.changePassword" :changePassword="changePassword" :saving="isChangingPassword" />
					<CoderProfileContext v-if="profile.isNinja" />
					<ChildrenList v-if="profile.isParent" />
					<slot name="roleDetails" :member="profile" :permissions="permissions" :mode="mode" />
				</template>
			</div>
		</template>
	</UDashboardPanel>
</template>

<style scoped lang="scss">
	.ProfileEditAction { justify-self: start; }
	.MyProfile { display: grid; gap: calc(var(--spacing) * 6); padding: calc(var(--spacing) * 4); max-width: 60rem; }
</style>
