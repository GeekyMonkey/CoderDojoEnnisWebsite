<script setup lang="ts">
	import { ref, watch, type Ref } from "vue";
	import type { ProfileMode } from "#shared/types/MemberProfile";
	import { useUserProfilesStore } from "~/stores/useUserProfilesStore";

	const props = defineProps<{ memberId: string }>();
	const { t } = useI18n();
	const { profile, permissions, isPending, isError, isSaving, save } = useUserProfilesStore((): string => props.memberId);
	const mode: Ref<ProfileMode> = ref("view");

	watch((): string => props.memberId, (): void => { mode.value = "view"; });
</script>

<template>
	<div class="UserProfile">
		<p v-if="isPending">{{ t("profile.loading") }}</p>
		<UAlert v-else-if="isError" color="error" :title="t('profile.loadError')" />
		<template v-else-if="profile">
			<slot name="details" :member="profile" :permissions="permissions">
				<ProfileDetails :member="profile" :mode="mode" :canEdit="permissions?.editDetails ?? false" :saving="isSaving" :save="save" @edit="mode = 'edit'" @cancel="mode = 'view'" @saved="mode = 'view'" />
			</slot>
			<slot name="roleDetails" :member="profile" :permissions="permissions" />
		</template>
	</div>
</template>

<style scoped lang="scss">
	.UserProfile { display: grid; gap: calc(var(--spacing) * 6); }
</style>
