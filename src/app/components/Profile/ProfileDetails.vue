<script setup lang="ts">
	import { computed, ref, type ComputedRef, type Ref } from "vue";
	import { memberProfileFieldsSchema, profileModeSchema, type MemberProfileFields, type MemberProfileUpdate, type ProfileMode } from "#shared/types/MemberProfile";
	import type { MemberModel } from "#shared/types/models/MemberModel";
	import { useProfileDraft } from "~/composables/useProfileDraft";

	const props = withDefaults(defineProps<{
		member: MemberModel;
		mode?: ProfileMode;
		canEdit?: boolean;
		saving?: boolean;
		save?: (update: MemberProfileUpdate) => Promise<MemberModel>;
	}>(), { mode: "view", canEdit: false, saving: false });
	const emit = defineEmits<{ edit: []; cancel: []; saved: [] }>();

	type ProfileField = { key: keyof MemberProfileFields; autocomplete: string; type: "text" | "email" | "tel" };
	type DisplayField = ProfileField & { value: string };

	const FIELDS: ProfileField[] = [
		{ key: "nameFirst", autocomplete: "given-name", type: "text" },
		{ key: "nameLast", autocomplete: "family-name", type: "text" },
		{ key: "email", autocomplete: "email", type: "email" },
		{ key: "phone", autocomplete: "tel", type: "tel" },
		{ key: "githubLogin", autocomplete: "off", type: "text" },
		{ key: "scratchName", autocomplete: "off", type: "text" },
		{ key: "xboxGamertag", autocomplete: "off", type: "text" },
	];
	const { t } = useI18n();
	const { fields, baseline, dirty, remoteChanged, reset } = useProfileDraft((): MemberModel => props.member);
	const notice: Ref<string | null> = ref(null);
	const error: Ref<string | null> = ref(null);
	const editing: ComputedRef<boolean> = computed((): boolean => profileModeSchema.parse(props.mode) === "edit" && props.canEdit && Boolean(props.save));
	const displayFields: ComputedRef<DisplayField[]> = computed((): DisplayField[] => FIELDS.map((field: ProfileField): DisplayField => ({ ...field, value: props.member[field.key] ?? "—" })));

	/** Keep input values typed while allowing optional fields to be cleared. */
	function updateField(key: keyof MemberProfileFields, value: string | number): void {
		fields[key] = String(value);
	}

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
	<UPageCard :title="t('profile.details')">
		<MemberAvatar :member="member" size="lg" linkTo="NONE" />
		<p>{{ t("profile.login") }}: {{ member.login ?? '—' }}</p>
		<UAlert v-if="notice" color="success" :title="notice" />
		<template v-if="!editing">
			<dl class="ProfileFields">
				<div v-for="field in displayFields" :key="field.key">
					<dt>{{ t(`profile.${field.key}`) }}</dt>
					<dd>{{ field.value }}</dd>
				</div>
			</dl>
			<UButton v-if="canEdit && save" @click="emit('edit')">{{ t("profile.edit") }}</UButton>
		</template>
		<UForm v-else :schema="memberProfileFieldsSchema" :state="fields" class="ProfileForm" @submit="submit">
			<UAlert v-if="remoteChanged" color="warning" :title="t('profile.remoteChanged')" />
			<div class="ProfileFields">
				<UFormField v-for="field in FIELDS" :key="field.key" :name="field.key" :label="t(`profile.${field.key}`)">
					<UInput :modelValue="fields[field.key] ?? ''" :type="field.type" :autocomplete="field.autocomplete" :disabled="saving" class="ProfileInput" @update:modelValue="(value: string | number): void => updateField(field.key, value)" />
				</UFormField>
			</div>
			<UAlert v-if="error" color="error" :title="error" />
			<div class="ProfileActions">
				<UButton type="submit" :loading="saving" :disabled="!dirty || remoteChanged">{{ t("profile.save") }}</UButton>
				<UButton variant="outline" :disabled="saving" @click="cancel">{{ t("profile.cancel") }}</UButton>
			</div>
		</UForm>
	</UPageCard>
</template>

<style scoped lang="scss">
	.ProfileForm { display: grid; gap: calc(var(--spacing) * 4); }
	.ProfileFields { display: grid; grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr)); gap: calc(var(--spacing) * 4); }
	.ProfileFields dt { font-weight: 600; }
	.ProfileFields dd { margin: 0; overflow-wrap: anywhere; }
	.ProfileInput { width: 100%; }
	.ProfileActions { display: flex; gap: calc(var(--spacing) * 3); flex-wrap: wrap; }
</style>
