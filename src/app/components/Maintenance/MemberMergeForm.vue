<script setup lang="ts">
import { computed, ref, type ComputedRef, type Ref } from "vue";
import { z } from "zod";
import MergeFieldChoice from "~/components/Maintenance/MergeFieldChoice.vue";
import { MERGE_FIELDS, MemberMergeSchema, type MergeChoices, type MergeField, type MemberMerge } from "#shared/types/MemberMerge";
import type { MemberModel } from "#shared/types/models/MemberModel";
import type { TeamModel } from "#shared/types/models/TeamModel";
import { compareMemberNames } from "#shared/utils/MemberNames";
const props = defineProps<{ member: MemberModel; members: MemberModel[]; teams: TeamModel[]; actorId: string; saving: boolean; merge: (id: string, body: MemberMerge) => Promise<MemberModel> }>();
const emit = defineEmits<{ merged: [member: MemberModel] }>();
type RoleFlag = { key: "isNinja" | "isParent" | "isMentor" | "gardaVetted" | "registeredCurrentTerm"; label: string; enabled: boolean };
type FieldRow = { field: MergeField; label: string; keep: string; duplicate: string };
const { t } = useI18n();
const search: Ref<string> = ref("");
const limit: Ref<number> = ref(20);
const preview: Ref<{ keep: MemberModel; duplicate: MemberModel } | null> = ref(null);
const choices: Ref<MergeChoices> = ref({ birthYear: "keep", email: "keep", phone: "keep", githubLogin: "keep", scratchName: "keep", xboxGamertag: "keep", teamId: "keep", goalShortTerm: "keep", goalLongTerm: "keep" });
const error: Ref<boolean> = ref(false);
const candidates: ComputedRef<MemberModel[]> = computed((): MemberModel[] => {
 const parsed: z.ZodSafeParseResult<string> = z.string().trim().max(200).safeParse(search.value);
 if (!parsed.success || !props.actorId) return [];
 const term: string = parsed.data.toLocaleLowerCase();
 return props.members.filter((member: MemberModel): boolean => member.id !== props.member.id && member.id !== props.actorId && props.member.id !== props.actorId && member.isNinja === props.member.isNinja && `${member.nameFirst ?? ""} ${member.nameLast ?? ""} ${member.login ?? ""}`.toLocaleLowerCase().includes(term)).sort(compareMemberNames);
});
const roles: ComputedRef<RoleFlag[]> = computed((): RoleFlag[] => {
 const selected: typeof preview.value = preview.value;
 if (!selected) return [];
 return (["isNinja", "isParent", "isMentor", "gardaVetted", "registeredCurrentTerm"] as const).map((key: RoleFlag["key"]): RoleFlag => ({ key, label: t(`maintenance.${key}`), enabled: selected.keep[key] || selected.duplicate[key] }));
});
const labels: ComputedRef<Record<MergeField, string>> = computed((): Record<MergeField, string> => ({ birthYear: t("maintenance.birthYear"), email: t("profile.email"), phone: t("profile.phone"), githubLogin: t("profile.githubLogin"), scratchName: t("profile.scratchName"), xboxGamertag: t("profile.xboxGamertag"), teamId: t("teams.label"), goalShortTerm: t("maintenance.goalShortTerm"), goalLongTerm: t("maintenance.goalLongTerm") }));
const teamNames: ComputedRef<Record<string, string>> = computed((): Record<string, string> => Object.fromEntries(props.teams.map((team: TeamModel): [string, string] => [team.id, team.teamName])));
const fieldRows: ComputedRef<FieldRow[]> = computed((): FieldRow[] => {
 const selected: typeof preview.value = preview.value;
 return selected ? MERGE_FIELDS.map((field: MergeField): FieldRow => ({ field, label: labels.value[field], keep: `${t("accountMerge.keep")}: ${value(selected.keep,field)}`, duplicate: `${t("accountMerge.duplicate")}: ${value(selected.duplicate,field)}` })) : [];
});
/** Capture the exact records presented for confirmation; remote edits then cause a conflict. */
function choose(member: MemberModel): void { preview.value = { keep: { ...props.member }, duplicate: { ...member } }; error.value = false; for (const field of MERGE_FIELDS) choices.value[field] = props.member[field] === null && member[field] !== null ? "duplicate" : "keep"; }
/** Render selected field values, resolving a team identity to its name. */
function value(member: MemberModel, field: MergeField): string { const raw: string | number | null = member[field]; return field === "teamId" ? teamNames.value[String(raw)] ?? t("maintenance.noTeam") : raw === null || raw === "" ? "—" : String(raw); }
/** Update a single closed-set field choice. */
function change(field: MergeField, selected: MergeChoices[MergeField]): void { choices.value[field] = selected; }
/** Submit the validated review through the supplied store action. */
async function submit(): Promise<void> {
 if (!preview.value || props.saving) return;
 try { error.value = false; const body: MemberMerge = MemberMergeSchema.parse({ duplicateId: preview.value.duplicate.id, expectedKeep: preview.value.keep, expectedDuplicate: preview.value.duplicate, choices: choices.value }); emit("merged", await props.merge(props.member.id, body)); }
 catch { error.value = true; preview.value = null; }
}
</script>
<template><section class="MemberMergeForm"><p>{{ t('accountMerge.description') }}</p><UInput v-model="search" :maxlength="200" :aria-label="t('maintenance.search')" :placeholder="t('accountMerge.choose')" /><p>{{ t('maintenance.membersCount', { count: candidates.length }) }}</p><div v-if="!preview" class="Candidates"><UButton v-for="member in candidates.slice(0, limit)" :key="member.id" :disabled="saving" variant="outline" @click="choose(member)">{{ member.nameFirst }} {{ member.nameLast }} · {{ member.login || '—' }}</UButton><UButton v-if="limit < candidates.length" @click="limit += 20">{{ t('maintenance.showMore') }}</UButton></div><template v-else><h2>{{ t('accountMerge.keep') }}: {{ preview.keep.nameFirst }} {{ preview.keep.nameLast }}</h2><h2>{{ t('accountMerge.duplicate') }}: {{ preview.duplicate.nameFirst }} {{ preview.duplicate.nameLast }}</h2><MergeFieldChoice v-for="row in fieldRows" :key="row.field" :field="row.field" :label="row.label" :keep="row.keep" :duplicate="row.duplicate" :selected="choices[row.field]" :disabled="saving" @change="change" /><div class="MergeFlags"><UCheckbox v-for="flag in roles" :key="flag.key" :modelValue="flag.enabled" :label="flag.label" disabled /></div><div class="Actions"><UButton color="warning" :loading="saving" @click="submit">{{ t('accountMerge.confirm') }}</UButton><UButton :disabled="saving" variant="outline" @click="preview = null">{{ t('achievementReviews.cancel') }}</UButton></div></template><UAlert v-if="error" color="error" :title="t('accountMerge.error')" /></section></template>
<style scoped lang="scss">
.MemberMergeForm, .Candidates { display: grid; gap: calc(var(--spacing) * 4); min-width: 0; } .MergeFlags, .Actions { display: flex; flex-wrap: wrap; gap: calc(var(--spacing) * 3); } h2 { font-weight: 600; overflow-wrap: anywhere; }
</style>
