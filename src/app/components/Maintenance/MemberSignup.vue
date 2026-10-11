<script setup lang="ts">
	import { useActionNotifications } from "~/composables/useActionNotifications";
	import { requestFailureMessage } from "#shared/utils/RequestFailure";
	import { reactive } from "vue";
	import { newMemberFormSchema, newMemberSchema, newAccount, type NewMember, type NewMemberForm, type MemberRole } from "#shared/types/MemberMaintenance";
	import type { MemberModel } from "#shared/types/models/MemberModel";
	import type { TeamModel } from "#shared/types/models/TeamModel";
	const props = defineProps<{ role: MemberRole; teams: TeamModel[]; saving: boolean; create: (body: NewMember) => Promise<MemberModel> }>();
	const emit = defineEmits<{ created: [member: MemberModel]; cancel: [] }>();
	const { t } = useI18n();
	const { publish } = useActionNotifications();
	const fields: NewMemberForm = reactive({ profile: { nameFirst: "", nameLast: "", email: null, phone: null, githubLogin: null, scratchName: null, xboxGamertag: null }, account: newAccount(props.role), password: "", confirmation: "" });

	/** Validate signup and clear entered credentials after creating the member. */
	async function submit(): Promise<void> {
		if (props.saving) return;
		try {
			const parsed: NewMemberForm = newMemberFormSchema.parse(fields);
			const member: MemberModel = await props.create(newMemberSchema.parse({ profile: parsed.profile, account: parsed.account, password: parsed.password || null }));
			fields.password = ""; fields.confirmation = ""; emit("created", member); publish({ name: "maintenance.membersignup.success", severity: "success", message: t("actionNotifications.created") });
		} catch (failure: unknown) { publish({ name: "maintenance.membersignup.error", severity: "error", message: requestFailureMessage(failure) ?? t("maintenance.saveError") }); }
	}
</script>
<template>
	<UPageCard :title="t('maintenance.signup')">
		<UForm :schema="newMemberFormSchema" :state="fields" class="SignupForm" @submit="submit">
			<ProfileFieldInputs :fields="fields.profile" pathPrefix="profile." :disabled="saving" />
			<AccountFields :fields="fields.account" :teams="teams" pathPrefix="account." :disabled="saving" />
			<p>{{ t('maintenance.passwordOptional') }}</p>
			<UFormField name="password" :label="t('profile.newPassword')"><UInput v-model="fields.password" type="password" autocomplete="new-password" :disabled="saving" /></UFormField>
			<UFormField name="confirmation" :label="t('profile.confirmPassword')"><UInput v-model="fields.confirmation" type="password" autocomplete="new-password" :disabled="saving" /></UFormField>

			<div class="SignupActions"><UButton type="submit" :loading="saving">{{ t('maintenance.create') }}</UButton><UButton variant="outline" :disabled="saving" @click="emit('cancel')">{{ t('profile.cancel') }}</UButton></div>
		</UForm>
	</UPageCard>
</template>
<style scoped lang="scss">
	.SignupForm { display: grid; gap: calc(var(--spacing) * 4); } .SignupActions { display: flex; gap: calc(var(--spacing) * 3); }
</style>
