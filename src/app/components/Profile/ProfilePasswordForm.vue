<script setup lang="ts">
	import { reactive, ref, type Ref } from "vue";
	import { profilePasswordFormSchema, profilePasswordSchema, type ProfilePasswordChange, type ProfilePasswordForm } from "#shared/types/MemberProfile";

	const props = withDefaults(defineProps<{
		changePassword: (change: ProfilePasswordChange) => Promise<null>;
		saving?: boolean;
	}>(), { saving: false });

	const { t } = useI18n();
	const state: ProfilePasswordForm = reactive({ currentPassword: "", newPassword: "", confirmation: "" });
	const notice: Ref<string | null> = ref(null);
	const error: Ref<string | null> = ref(null);

	/** Validate all password inputs before invoking the supplied store action. */
	async function submit(): Promise<void> {
		if (props.saving) return;
		error.value = null;
		notice.value = null;
		const parsed: ReturnType<typeof profilePasswordFormSchema.safeParse> = profilePasswordFormSchema.safeParse(state);
		if (!parsed.success) return;
		try {
			await props.changePassword(profilePasswordSchema.parse({ currentPassword: parsed.data.currentPassword, newPassword: parsed.data.newPassword }));
			notice.value = t("profile.passwordSaved");
		} catch {
			error.value = t("profile.passwordError");
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
			<UAlert v-if="error" color="error" :title="error" />
			<UAlert v-if="notice" color="success" :title="notice" />
			<UButton type="submit" :loading="saving">{{ t("profile.changePassword") }}</UButton>
		</UForm>
	</UPageCard>
</template>

<style scoped lang="scss">
	.PasswordForm { display: grid; gap: calc(var(--spacing) * 4); }
</style>
