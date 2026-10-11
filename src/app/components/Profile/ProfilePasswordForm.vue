<script setup lang="ts">
	import { useActionNotifications } from "~/composables/useActionNotifications";
	import { reactive } from "vue";
	import { profilePasswordFormSchema, profilePasswordSchema, type ProfilePasswordChange, type ProfilePasswordForm } from "#shared/types/MemberProfile";

	const props = withDefaults(defineProps<{
		changePassword: (change: ProfilePasswordChange) => Promise<null>;
		saving?: boolean;
	}>(), { saving: false });

	const { t } = useI18n();
	const { publish } = useActionNotifications();
	const state: ProfilePasswordForm = reactive({ currentPassword: "", newPassword: "", confirmation: "" });

	/** Validate all password inputs before invoking the supplied store action. */
	async function submit(): Promise<void> {
		if (props.saving) return;

		const parsed: ReturnType<typeof profilePasswordFormSchema.safeParse> = profilePasswordFormSchema.safeParse(state);
		if (!parsed.success) return;
		try {
			await props.changePassword(profilePasswordSchema.parse({ currentPassword: parsed.data.currentPassword, newPassword: parsed.data.newPassword }));
			publish({ name: "profile.profilepasswordform.success", severity: "success", message: t("profile.passwordSaved") });
		} catch {
			publish({ name: "profile.profilepasswordform.error", severity: "error", message: t("profile.passwordError") });
		} finally {
			Object.assign(state, { currentPassword: "", newPassword: "", confirmation: "" });
		}
	}
</script>

<template>
	<UPageCard :title="t('profile.changePassword')">
		<UForm :schema="profilePasswordFormSchema" :state="state" class="PasswordForm" @submit="submit">
			<UFormField name="currentPassword" :label="t('profile.currentPassword')"><UInput v-model="state.currentPassword" type="password" autocomplete="current-password" :disabled="saving" /></UFormField>
			<UFormField name="newPassword" :label="t('profile.newPassword')"><UInput v-model="state.newPassword" type="password" autocomplete="new-password" :disabled="saving" /></UFormField>
			<UFormField name="confirmation" :label="t('profile.confirmPassword')"><UInput v-model="state.confirmation" type="password" autocomplete="new-password" :disabled="saving" /></UFormField>

			<UButton type="submit" :loading="saving">{{ t("profile.changePassword") }}</UButton>
		</UForm>
	</UPageCard>
</template>

<style scoped lang="scss">
	.PasswordForm { display: grid; gap: calc(var(--spacing) * 4); }
</style>
