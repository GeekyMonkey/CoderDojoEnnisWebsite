import { computed, reactive, ref, toValue, watch, type ComputedRef, type MaybeRefOrGetter, type Ref } from "vue";
import { memberProfileSnapshot, type ProfileEditableFields, type MemberProfileSnapshot } from "#shared/types/MemberProfile";
import type { MemberModel } from "#shared/types/models/MemberModel";

type ProfileDraft = {
	fields: ProfileEditableFields;
	baseline: Ref<MemberProfileSnapshot | null>;
	dirty: ComputedRef<boolean>;
	remoteChanged: ComputedRef<boolean>;
	reset: (member: MemberModel) => void;
};

/** Manage profile drafts without replacing unsaved edits on realtime updates. */
export function useProfileDraft(member: MaybeRefOrGetter<MemberModel>): ProfileDraft {
	const fields: ProfileEditableFields = reactive({ login: "", nameFirst: "", nameLast: "", email: null, phone: null, githubLogin: null, scratchName: null, xboxGamertag: null });
	const baseline: Ref<MemberProfileSnapshot | null> = ref(null);
	const dirty: ComputedRef<boolean> = computed((): boolean => baseline.value !== null && JSON.stringify(fields) !== JSON.stringify({ ...baseline.value, login: baseline.value.login ?? "", nameFirst: baseline.value.nameFirst ?? "", nameLast: baseline.value.nameLast ?? "" }));
	const remoteChanged: ComputedRef<boolean> = computed((): boolean => baseline.value !== null && JSON.stringify(memberProfileSnapshot(toValue(member))) !== JSON.stringify(baseline.value));

	/** Load a new baseline when edits have been saved or explicitly discarded. */
	function reset(value: MemberModel): void {
		baseline.value = memberProfileSnapshot(value);
		Object.assign(fields, baseline.value, { login: value.login ?? "", nameFirst: value.nameFirst ?? "", nameLast: value.nameLast ?? "" });
	}

	watch((): MemberModel => toValue(member), (value: MemberModel, previous: MemberModel | undefined): void => {
		if (!baseline.value || previous?.id !== value.id || !dirty.value) reset(value);
	}, { immediate: true });
	return { fields, baseline, dirty, remoteChanged, reset };
}
