<script setup lang="ts">
	import { computed, ref, type ComputedRef, type Ref } from "vue";
	import { memberProfileFieldsSchema, profileModeSchema, type MemberProfileFields, type MemberProfileUpdate, type ProfileMode } from "#shared/types/MemberProfile";
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
	const { fields, baseline, dirty, remoteChanged, reset } = useProfileDraft((): MemberModel => props.member);
	const notice: Ref<string | null> = ref(null);
	const error: Ref<string | null> = ref(null);
	const editing: ComputedRef<boolean> = computed((): boolean => profileModeSchema.parse(props.mode) === "edit" && props.canEdit && Boolean(props.save));
	const displayFields: ComputedRef<DisplayField[]> = computed((): DisplayField[] => PROFILE_FIELDS.map((field: ProfileField): DisplayField => ({ ...field, value: props.member[field.key] ?? "—" })));

	/** Validate and submit only editable fields through the supplied store action. */
	async function submit(): Promise<void> {
		if (!editing.value || !baseline.value || !props.save || props.saving || remoteChanged.value) return;
		error.value = null;
		notice.value = null;
		try {
			const member: MemberModel = await props.save({ fields: memberProfileFieldsSchema.parse(fields), expected: baseline.value });
			reset(member);
			notice.value = t("profile.saved");
			emit("saved");
		} catch {
			error.value = t("profile.saveError");
		}
	}

	/** Discard local edits and return to display mode. */
	function cancel(): void {
		reset(props.member);
		error.value = null;
		notice.value = null;
		emit("cancel");
	}
</script>

<template>
	<UPageCard>
		<ProfileImages v-if="changeImages" :member="member" :canEdit="editing" :saving="savingImages ?? false" :changeImages="changeImages" />
		<MemberAvatar v-else :member="member" size="lg" linkTo="NONE" />
		<p>{{ t("profile.login") }}: {{ member.login ?? '—' }}</p>
		<UAlert v-if="notice" color="success" :title="notice" />
		<template v-if="!editing">
			<dl class="ProfileFields">
				<div v-for="field in displayFields" :key="field.key">
					<dt>{{ t(`profile.${field.key}`) }}</dt>
					<dd>{{ field.value }}</dd>
				</div>
			</dl>
			<UButton class="ProfileEditAction" v-if="canEdit && save" @click="emit('edit')">{{ t("profile.edit") }}</UButton>
		</template>
		<UForm v-else :schema="memberProfileFieldsSchema" :state="fields" class="ProfileForm" @submit="submit">
			<UAlert v-if="remoteChanged" color="warning" :title="t('profile.remoteChanged')" />
			<ProfileFieldInputs :fields="fields" :disabled="saving" />
			<UAlert v-if="error" color="error" :title="error" />
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
