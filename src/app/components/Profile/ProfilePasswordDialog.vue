<script setup lang="ts">
	import { ref, type Ref } from "vue";
	import type { ProfilePasswordChange, SelectedPasswordReset } from "#shared/types/MemberProfile";
	const props = defineProps<{
		saving: boolean;
		changePassword?: (change: ProfilePasswordChange) => Promise<null>;
		resetPassword?: (change: SelectedPasswordReset) => Promise<null>;
	}>();
	const { t } = useI18n();
	const open: Ref<boolean> = ref(false);
	/** Close after a successful password change; leave failures available for retry. */
	async function change(value: ProfilePasswordChange): Promise<null> {
		if (!props.changePassword) return null;
		await props.changePassword(value);
		open.value = false;
		return null;
	}
	/** Close after a successful authorized reset. */
	async function reset(value: SelectedPasswordReset): Promise<null> {
		if (!props.resetPassword) return null;
		await props.resetPassword(value);
		open.value = false;
		return null;
	}
</script>

<template>
	<div class="PasswordDialog">
		<UButton variant="outline" icon="i-lucide-key-round" @click="open = true">{{ t(changePassword ? 'profile.changePassword' : 'profile.resetPassword') }}</UButton>
		<UModal :open="open" :dismissible="!saving" :close="!saving" :title="t(changePassword ? 'profile.changePassword' : 'profile.resetPassword')" @update:open="(value: boolean): void => { if (!saving) open = value; }">
			<template #body>
				<ProfilePasswordForm v-if="open && changePassword" :saving="saving" :changePassword="change" />
				<PasswordResetForm v-else-if="open && resetPassword" :saving="saving" :resetPassword="reset" cancelable @cancel="open = false" />
			</template>
		</UModal>
	</div>
</template>

<style scoped lang="scss">
	.PasswordDialog { justify-self: start; }
</style>
