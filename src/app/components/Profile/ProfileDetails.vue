<script setup lang="ts">
	import MemberCurrentBelt from "~/components/Members/MemberCurrentBelt.vue";
	import { requestFailureMessage } from "#shared/utils/RequestFailure";
	import { useActionNotifications } from "~/composables/useActionNotifications";
	import { computed, type ComputedRef } from "vue";
	import { profileEditableFieldsSchema, profileModeSchema, type MemberProfileFields, type MemberProfileUpdate, type ProfileMode } from "#shared/types/MemberProfile";
	import type { ProfileImageAction } from "#shared/types/ProfileImages";
	import type { MemberModel } from "#shared/types/models/MemberModel";
	import { PROFILE_FIELDS, type ProfileField } from "./profileFields";
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
	const emit = defineEmits<{ edit: []; cancel: []; saved: [] }>();

	type DisplayField = ProfileField & { value: string };

	const { t } = useI18n();
	const { publish } = useActionNotifications();
	const { fields, baseline, dirty, remoteChanged, reset } = useProfileDraft((): MemberModel => props.member);

	const editing: ComputedRef<boolean> = computed((): boolean => profileModeSchema.parse(props.mode) === "edit" && props.canEdit && Boolean(props.save));
	const displayFields: ComputedRef<DisplayField[]> = computed((): DisplayField[] => PROFILE_FIELDS.map((field: ProfileField): DisplayField => ({ ...field, value: props.member[field.key] ?? "—" })));

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

	/** Discard local edits and return to display mode. */
	function cancel(): void {
		reset(props.member);
		emit("cancel");
	}
</script>

<template>
	<UPageCard>
		<MemberCurrentBelt :member="member" /><ProfileImages v-if="changeImages" :member="member" :canEdit="editing" :saving="savingImages ?? false" :changeImages="changeImages" />
		<MemberAvatar v-else :member="member" size="lg" linkTo="NONE" />
		<p v-if="!editing">{{ t("profile.login") }}: {{ member.login ?? '—' }}</p>
		<template v-if="!editing">
			<ProfileExternalLinks :member="member" /><dl class="ProfileFields">
				<div v-for="field in displayFields" :key="field.key">
					<dt>{{ t(`profile.${field.key}`) }}</dt>
					<dd>{{ field.value }}</dd>
				</div>
			</dl>
			<UButton class="ProfileEditAction" v-if="canEdit && save" @click="emit('edit')">{{ t("profile.edit") }}</UButton>
		</template>
		<UForm v-else :schema="profileEditableFieldsSchema" :state="fields" class="ProfileForm" @submit="submit">
			<UAlert v-if="remoteChanged" color="warning" :title="t('profile.remoteChanged')" />
			<ProfileFieldInputs :includeLogin="true" :fields="fields" :disabled="saving" />
			<div class="ProfileActions">
				<UButton type="submit" :loading="saving" :disabled="!dirty || remoteChanged">{{ t("profile.save") }}</UButton>
				<UButton variant="outline" :disabled="saving" @click="cancel">{{ t("profile.cancel") }}</UButton>
			</div>
		</UForm>
	</UPageCard>
</template>

<style scoped lang="scss">
	.ProfileEditAction { width: fit-content; align-self: flex-start; justify-self: start; }
	.ProfileForm { display: grid; gap: calc(var(--spacing) * 4); }
	.ProfileFields { display: grid; grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr)); gap: calc(var(--spacing) * 4); }
	.ProfileFields dt { font-weight: 600; }
	.ProfileFields dd { margin: 0; overflow-wrap: anywhere; }
	.ProfileInput { width: 100%; }
	.ProfileActions { display: flex; gap: calc(var(--spacing) * 3); flex-wrap: wrap; }
</style>
