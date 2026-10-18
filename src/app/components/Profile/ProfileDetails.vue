<script setup lang="ts">
	import ProfileFieldsDisplay from "./ProfileFieldsDisplay.vue";
	import ProfileCurrentBelt from "./ProfileCurrentBelt.vue";
	import { requestFailureMessage } from "#shared/utils/RequestFailure";
	import { useActionNotifications } from "~/composables/useActionNotifications";
	import { computed, watch, type ComputedRef } from "vue";
	import { profileEditableFieldsSchema, profileModeSchema, type MemberProfileUpdate, type ProfileMode } from "#shared/types/MemberProfile";
	import type { ProfileImageAction } from "#shared/types/ProfileImages";
	import type { MemberModel } from "#shared/types/models/MemberModel";
	import { profileFieldsForRoles } from "./profileFields";
	import { useProfileDraft } from "~/composables/useProfileDraft";

	const props = withDefaults(defineProps<{
		member: MemberModel;
		mode?: ProfileMode;
		canEdit?: boolean;
		saving?: boolean;
		savingImages?: boolean;
		changeImages?: (action: ProfileImageAction) => Promise<MemberModel>;
		save?: (update: MemberProfileUpdate) => Promise<MemberModel>;
	}>(), { mode: "view", canEdit: false, saving: false });
	const emit = defineEmits<{ cancel: []; saved: [] }>();

	const { t } = useI18n();
	const { publish } = useActionNotifications();
	const { fields, baseline, dirty, remoteChanged, reset } = useProfileDraft((): MemberModel => props.member);

	const editing: ComputedRef<boolean> = computed((): boolean => profileModeSchema.parse(props.mode) === "edit" && props.canEdit && Boolean(props.save));

	/** Validate and submit only editable fields through the supplied store action. */
	async function submit(): Promise<void> {
		if (!editing.value || !baseline.value || !props.save || props.saving || remoteChanged.value) return;
		try {
			const member: MemberModel = await props.save({ fields: profileEditableFieldsSchema.parse(fields), expected: baseline.value });
			reset(member);
			publish({ name: "profile.profiledetails.success", severity: "success", message: t("profile.saved") });
			emit("saved");
		} catch (failure: unknown) {
			publish({ name: "profile.profiledetails.error", severity: "error", message: requestFailureMessage(failure) ?? t("profile.saveError") });
		}
	}

	/** Discard local edits and notify the containing profile. */
	function cancel(): void {
		reset(props.member);
		emit("cancel");
	}
	watch((): ProfileMode => props.mode, (): void => { reset(props.member); });
</script>

<template>
	<UPageCard>
		<MemberRoles v-if="editing" :modelValue="member" mode="view" />
		<p v-if="editing && member.isNinja">{{ t("maintenance.birthYear") }}: {{ member.birthYear ?? '—' }}</p>
		<ProfileCurrentBelt v-if="member.isNinja" :memberId="member.id" /><ProfileImages v-if="changeImages" :member="member" :canEdit="editing" :saving="savingImages ?? false" :changeImages="changeImages" />
		<MemberAvatar v-else :member="member" size="lg" linkTo="NONE" />
		<ProfileFieldsDisplay v-if="!editing" :member="member" />
		<UForm v-else :schema="profileEditableFieldsSchema" :state="fields" class="ProfileForm" @submit="submit">
			<UAlert v-if="remoteChanged" color="warning" :title="t('profile.remoteChanged')" />
			<ProfileFieldInputs :includeLogin="true" :fields="fields" :visibleFields="profileFieldsForRoles(member)" :disabled="saving" />
			<div class="ProfileActions">
				<UButton type="submit" :loading="saving" :disabled="!dirty || remoteChanged">{{ t("profile.save") }}</UButton>
				<UButton variant="outline" :disabled="saving" @click="cancel">{{ t("profile.cancel") }}</UButton>
			</div>
		</UForm>
	</UPageCard>
</template>

<style scoped lang="scss">
	.ProfileForm { display: grid; gap: calc(var(--spacing) * 4); }
	.ProfileInput { width: 100%; }
	.ProfileActions { display: flex; gap: calc(var(--spacing) * 3); flex-wrap: wrap; }
</style>
