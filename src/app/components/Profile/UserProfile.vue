<script setup lang="ts">
	import { computed, ref, watch, type ComputedRef, type Ref } from "vue";
	import type { ProfileMode } from "#shared/types/MemberProfile";
	import { useUserProfilesStore } from "~/stores/useUserProfilesStore";

	const props = defineProps<{ memberId: string; mode?: ProfileMode }>();
	const emit = defineEmits<{ cancel: [] }>();
	const { t } = useI18n();
	const { profile, permissions, isPending, isError, isSaving, isSavingImages, changeImages, save } = useUserProfilesStore((): string => props.memberId);
	const localMode: Ref<ProfileMode> = ref("view");
	const mode: ComputedRef<ProfileMode> = computed((): ProfileMode => props.mode ?? localMode.value);

    /** Leave local editing and notify a containing profile to return to display mode. */
    function cancel(): void { localMode.value = "view"; emit("cancel"); }
	watch((): string => props.memberId, (): void => { localMode.value = "view"; });
</script>

<template>
	<div class="UserProfile">
		<p v-if="isPending">{{ t("profile.loading") }}</p>
		<UAlert v-else-if="isError" color="error" :title="t('profile.loadError')" />
		<template v-else-if="profile">
			<UButton v-if="props.mode === undefined && mode === 'view' && permissions?.editDetails" class="ProfileEditAction" @click="localMode = 'edit'">{{ t("profile.edit") }}</UButton>
			<slot name="details" :member="profile" :permissions="permissions" :mode="mode">
				<ProfileDetails :member="profile" :mode="mode" :canEdit="permissions?.editDetails ?? false" :saving="isSaving || isSavingImages" :save="save" :savingImages="isSavingImages" :changeImages="changeImages" @cancel="cancel" @saved="localMode = 'view'" />
			</slot>
			<slot name="roleDetails" :member="profile" :permissions="permissions" :mode="mode" />
		</template>
	</div>
</template>

<style scoped lang="scss">
	.ProfileEditAction { justify-self: start; }
	.UserProfile { display: grid; gap: calc(var(--spacing) * 6); }
</style>
