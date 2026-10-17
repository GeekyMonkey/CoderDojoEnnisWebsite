<script setup lang="ts">
import { computed, ref, type ComputedRef, type Ref } from "vue";
import { z } from "zod";
import ProfileImage from "~/components/Profile/ProfileImage.vue";
import type { ProfileImageSlot } from "#shared/types/ProfileImages";
import MergeFieldChoice from "~/components/Maintenance/MergeFieldChoice.vue";
import { MERGE_FIELDS, reviewedMemberMerge, type MergeSource, type MergeImages, type MergeChoices, type MergeField, type MemberMerge } from "#shared/types/MemberMerge";
import type { MemberModel } from "#shared/types/models/MemberModel";
import type { TeamModel } from "#shared/types/models/TeamModel";
import { compareMemberNames } from "#shared/utils/MemberNames";
const props = defineProps<{ member: MemberModel; members: MemberModel[]; teams: TeamModel[]; actorId: string; saving: boolean; merge: (id: string, body: MemberMerge) => Promise<MemberModel> }>();
const emit = defineEmits<{ merged: [member: MemberModel] }>();
type RoleFlag = { key: "isNinja" | "isParent" | "isMentor"; label: string; enabled: boolean };
type FieldRow = { field: MergeField; label: string; keep: string; duplicate: string };
const { t } = useI18n();
const search: Ref<string> = ref("");
const limit: Ref<number> = ref(20);
const preview: Ref<{ keep: MemberModel; duplicate: MemberModel } | null> = ref(null);
const survivor: Ref<MergeSource | null> = ref(null);
const choices: Ref<Partial<MergeChoices>> = ref({});
const imageChoices: Ref<Partial<MergeImages>> = ref({});
const error: Ref<boolean> = ref(false);
const candidates: ComputedRef<MemberModel[]> = computed((): MemberModel[] => {
 const parsed: z.ZodSafeParseResult<string> = z.string().trim().max(200).safeParse(search.value);
 if (!parsed.success || !props.actorId) return [];
 const term: string = parsed.data.toLocaleLowerCase();
 return props.members.filter((member: MemberModel): boolean => member.id !== props.member.id && member.id !== props.actorId && props.member.id !== props.actorId && `${member.nameFirst ?? ""} ${member.nameLast ?? ""} ${member.login ?? ""}`.toLocaleLowerCase().includes(term)).sort(compareMemberNames);
});
const roles: ComputedRef<RoleFlag[]> = computed((): RoleFlag[] => {
 const selected: typeof preview.value = preview.value;
 if (!selected) return [];
 return (["isNinja", "isParent", "isMentor"] as const).map((key: RoleFlag["key"]): RoleFlag => ({ key, label: t(`maintenance.${key}`), enabled: selected.keep[key] || selected.duplicate[key] }));
});
const labels: ComputedRef<Record<MergeField, string>> = computed((): Record<MergeField, string> => ({ nameFirst: t("profile.nameFirst"), nameLast: t("profile.nameLast"), fingerprintId: t("maintenance.fingerprintId"), nfcTag: t("maintenance.nfcTag"), gardaVetted: t("maintenance.gardaVetted"), registeredCurrentTerm: t("maintenance.registeredCurrentTerm"), birthYear: t("maintenance.birthYear"), email: t("profile.email"), phone: t("profile.phone"), githubLogin: t("profile.githubLogin"), scratchName: t("profile.scratchName"), xboxGamertag: t("profile.xboxGamertag"), teamId: t("teams.label"), goalShortTerm: t("maintenance.goalShortTerm"), goalLongTerm: t("maintenance.goalLongTerm") }));
const teamNames: ComputedRef<Record<string, string>> = computed((): Record<string, string> => Object.fromEntries(props.teams.map((team: TeamModel): [string, string] => [team.id, team.teamName])));
const fieldRows: ComputedRef<FieldRow[]> = computed((): FieldRow[] => {
 const selected: typeof preview.value = preview.value;
 return selected ? MERGE_FIELDS.filter((field: MergeField): boolean => selected.keep[field] !== selected.duplicate[field]).map((field: MergeField): FieldRow => ({ field, label: labels.value[field], keep: `${t("accountMerge.keep")}: ${value(selected.keep,field)}`, duplicate: `${t("accountMerge.duplicate")}: ${value(selected.duplicate,field)}` })) : [];
});
const request: ComputedRef<MemberMerge | null> = computed((): MemberMerge | null => preview.value ? reviewedMemberMerge(preview.value.keep, preview.value.duplicate, survivor.value, choices.value, imageChoices.value) : null);
const imageSlots: ComputedRef<ProfileImageSlot[]> = computed((): ProfileImageSlot[] => preview.value ? (["photo", "avatar"] as const).filter((slot: ProfileImageSlot): boolean => {
 const key: "hasPhoto" | "hasAvatar" = slot === "photo" ? "hasPhoto" : "hasAvatar";
 return Boolean(preview.value?.keep[key] && preview.value?.duplicate[key]);
}) : []);
const credentials: ComputedRef<{ keep: string; duplicate: string } | null> = computed((): { keep: string; duplicate: string } | null => preview.value ? { keep: accountLabel(preview.value.keep), duplicate: accountLabel(preview.value.duplicate) } : null);
/** Identify the username and owner of each candidate account. */
function accountLabel(member: MemberModel): string {
 return `${member.login || t("accountMerge.noUsername")} · ${member.nameFirst ?? ""} ${member.nameLast ?? ""}`;
}
/** Select which account identity and password survives. */
function selectSurvivor(_field: string, source: MergeSource): void { survivor.value = source; }
/** Capture the exact records presented for confirmation; remote edits then cause a conflict. */
function choose(member: MemberModel): void { preview.value = { keep: { ...props.member }, duplicate: { ...member } }; error.value = false; survivor.value = null; choices.value = {}; imageChoices.value = {}; }
/** Render selected field values, resolving a team identity to its name. */
function value(member: MemberModel, field: MergeField): string { const raw: string | number | boolean | null = member[field]; if (typeof raw === "boolean") return t(raw ? "maintenance.yes" : "maintenance.no"); return field === "teamId" ? teamNames.value[String(raw)] ?? t("maintenance.noTeam") : raw === null || raw === "" ? "—" : String(raw); }
/** Update a single closed-set field choice. */
function change(field: string, selected: MergeSource): void { if (MERGE_FIELDS.includes(field as MergeField)) choices.value[field as MergeField] = selected; }
/** Record the independently selected Photo or Avatar source. */
function selectImage(slot: string, source: MergeSource): void { if (slot === "photo" || slot === "avatar") imageChoices.value[slot] = source; }
/** Submit the validated review through the supplied store action. */
async function submit(): Promise<void> {
 if (!request.value || props.saving) return;
 try { error.value = false; const body: MemberMerge = request.value; emit("merged", await props.merge(body.expectedKeep.id, body)); }
 catch { error.value = true; preview.value = null; }
}
</script>
<template>
 <section class="MemberMergeForm">
  <p>{{ t('accountMerge.description') }}</p>
  <template v-if="!preview">
   <UInput v-model="search" :maxlength="200" :aria-label="t('maintenance.search')" :placeholder="t('accountMerge.choose')" />
   <p>{{ t('maintenance.membersCount', { count: candidates.length }) }}</p>
   <div class="Candidates">
    <UButton v-for="member in candidates.slice(0, limit)" :key="member.id" :disabled="saving" variant="outline" @click="choose(member)">{{ member.nameFirst }} {{ member.nameLast }} · {{ member.login || '—' }}</UButton>
    <UButton v-if="limit < candidates.length" @click="limit += 20">{{ t('maintenance.showMore') }}</UButton>
   </div>
  </template>
  <form v-else class="MergeReview" @submit.prevent="submit">
   <p>{{ t('accountMerge.credentials') }}</p>
   <MergeFieldChoice v-if="credentials" field="login" :label="t('login.username')" :keep="credentials.keep" :duplicate="credentials.duplicate" :selected="survivor" :disabled="saving" @change="selectSurvivor" />
   <p v-if="fieldRows.length">{{ t('accountMerge.review') }}</p>
   <MergeFieldChoice v-for="row in fieldRows" :key="row.field" :field="row.field" :label="row.label" :keep="row.keep" :duplicate="row.duplicate" :selected="choices[row.field]" :disabled="saving" @change="change" />
   <p>{{ t('accountMerge.imageReview') }}</p>
   <MergeFieldChoice v-for="slot in imageSlots" :key="slot" :field="slot" :label="t(`profileImages.${slot}`)" :keep="preview.keep.login || '—'" :duplicate="preview.duplicate.login || '—'" :selected="imageChoices[slot] === 'none' ? null : imageChoices[slot]" :disabled="saving" @change="selectImage">
    <template #keep><span class="MergeImageOption">{{ preview.keep.login || '—' }}<ProfileImage :memberId="preview.keep.id" :slot="slot" :revision="preview.keep.id" /></span></template>
    <template #duplicate><span class="MergeImageOption">{{ preview.duplicate.login || '—' }}<ProfileImage :memberId="preview.duplicate.id" :slot="slot" :revision="preview.duplicate.id" /></span></template>
   </MergeFieldChoice>
   <p>{{ t('accountMerge.combined') }}</p>
   <div class="MergeFlags"><UCheckbox v-for="flag in roles" :key="flag.key" :modelValue="flag.enabled" :label="flag.label" disabled /></div>
   <p v-if="!request">{{ t('accountMerge.required') }}</p>
   <div class="Actions">
    <UButton type="submit" color="warning" :loading="saving" :disabled="!request || saving">{{ t('accountMerge.confirm') }}</UButton>
    <UButton type="button" :disabled="saving" variant="outline" @click="preview = null">{{ t('achievementReviews.cancel') }}</UButton>
   </div>
  </form>
  <UAlert v-if="error" color="error" :title="t('accountMerge.error')" />
 </section>
</template>
<style scoped lang="scss">
.MemberMergeForm, .Candidates, .MergeReview { display: grid; gap: calc(var(--spacing) * 4); min-width: 0; } .MergeFlags, .Actions { display: flex; flex-wrap: wrap; gap: calc(var(--spacing) * 3); } .MergeImageOption { display: grid; gap: calc(var(--spacing) * 2); width: 8rem; } h2 { font-weight: 600; overflow-wrap: anywhere; }
</style>
