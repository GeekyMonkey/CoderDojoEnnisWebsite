<script setup lang="ts">
	import { useActionNotifications } from "~/composables/useActionNotifications";
	import { requestFailureMessage } from "#shared/utils/RequestFailure";
	import { reactive, ref, type Ref } from "vue";
	import { passwordResetSchema, type PasswordReset } from "#shared/types/MemberMaintenance";
	const props = defineProps<{ saving: boolean; resetPassword: (body: PasswordReset) => Promise<null> }>();
	const { t } = useI18n();
	const { publish } = useActionNotifications();
	const open: Ref<boolean> = ref(false);

	const fields: PasswordReset = reactive({ newPassword: "", confirmation: "" });
	/** Discard credential input when closing the independent form. */
	function cancel(): void { fields.newPassword = ""; fields.confirmation = ""; open.value = false; }
	/** Reset credentials only after explicit submission of matching validated fields. */
	async function submit(): Promise<void> {
		if (props.saving) return;
		try { await props.resetPassword(passwordResetSchema.parse(fields)); cancel(); publish({ name: "maintenance.passwordresetform.success", severity: "success", message: t("profile.passwordSaved") }); }
		catch (failure: unknown) { publish({ name: "maintenance.passwordresetform.error", severity: "error", message: requestFailureMessage(failure) ?? t("profile.passwordError") }); }
	}
</script>
<template>
	<UPageCard :title="t('maintenance.resetPassword')">

		<UButton class="SectionEdit" v-if="!open" variant="outline" @click="open = true">{{ t('maintenance.resetPassword') }}</UButton>
		<UForm v-else :schema="passwordResetSchema" :state="fields" class="ResetForm" @submit="submit">
			<UFormField name="newPassword" :label="t('profile.newPassword')"><UInput v-model="fields.newPassword" type="password" autocomplete="new-password" :disabled="saving" /></UFormField>
			<UFormField name="confirmation" :label="t('profile.confirmPassword')"><UInput v-model="fields.confirmation" type="password" autocomplete="new-password" :disabled="saving" /></UFormField>

			<div class="ResetActions"><UButton type="submit" :loading="saving">{{ t('maintenance.resetPassword') }}</UButton><UButton variant="outline" :disabled="saving" @click="cancel">{{ t('profile.cancel') }}</UButton></div>
		</UForm>
	</UPageCard>
</template>
<style scoped lang="scss">
	.SectionEdit { width: fit-content; align-self: flex-start; justify-self: start; }
	.ResetForm { display: grid; gap: calc(var(--spacing) * 4); } .ResetActions { display: flex; gap: calc(var(--spacing) * 3); }
</style>
