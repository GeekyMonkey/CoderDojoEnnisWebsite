<script setup lang="ts">
import { computed, ref, type ComputedRef, type Ref } from "vue";
import { defaultReportSince, type ReportKind, type ReportRow } from "#shared/types/MentorReport";
import type { MemberImageSubject } from "#shared/types/MemberPresentation";
import { useMentorReportsStore } from "~/stores/useMentorReportsStore";
import { useMemberPresenceStore } from "~/stores/useMemberPresenceStore";
import MemberPhoto from "~/components/Members/MemberPhoto.vue";
import BeltColor from "~/components/Belts/BeltColor.vue";

const props = defineProps<{ kind: ReportKind }>();
const { t } = useI18n();
const { pageTitle } = useMemberLayoutContext();
const since: Ref<string> = ref(defaultReportSince());
const search: Ref<string> = ref("");
const downloading: Ref<boolean> = ref(false);
const downloadError: Ref<boolean> = ref(false);
const store: ReturnType<typeof useMentorReportsStore> = useMentorReportsStore(props.kind, since);
const { data, isPending, isFetching, isError } = store;
const presence: ReturnType<typeof useMemberPresenceStore> = useMemberPresenceStore();
const validDate: ComputedRef<boolean> = computed((): boolean => props.kind !== "belts" || /^\d{4}-\d{2}-\d{2}$/.test(since.value));
const rows: ComputedRef<ReportRow[]> = computed((): ReportRow[] => (data.value ?? []).filter((row: ReportRow): boolean => `${row.nameFirst} ${row.nameLast} ${row.email} ${row.belt?.color ?? ""} ${row.notes}`.toLocaleLowerCase().includes(search.value.trim().toLocaleLowerCase())));
const photos: ComputedRef<Record<string, MemberImageSubject>> = computed((): Record<string, MemberImageSubject> => Object.fromEntries((data.value ?? []).map((row: ReportRow): [string, MemberImageSubject] => [row.id, { id: row.memberId, nameFirst: row.nameFirst, nameLast: row.nameLast, hasPhoto: row.hasPhoto, hasAvatar: false, isMentor: props.kind === "mentors", isParent: props.kind === "parents", isNinja: props.kind === "belts" }])));
const borders: ComputedRef<Record<string, string | null>> = computed((): Record<string, string | null> => Object.fromEntries((data.value ?? []).map((row: ReportRow): [string, string | null] => [row.id, presence.presentById.value === null ? null : presence.presentById.value[row.memberId] ? "var(--color-green-500)" : row.registeredCurrentTerm ? "var(--color-orange-500)" : "var(--color-red-500)"])));
/** Download every matching award or contact, independently of the preview search. */
async function download(): Promise<void> {
 downloading.value = true; downloadError.value = false;
 try { await store.download(); } catch { downloadError.value = true; } finally { downloading.value = false; }
}
</script>

<template>
 <UDashboardPanel :id="`mentor-report-${kind}`">
  <template #header><DashboardHeading :pageTitle="pageTitle" /></template>
  <template #body>
   <div class="report-controls">
    <UFormField v-if="kind === 'belts'" :label="t('reports.since')"><UInput v-model="since" type="date" /></UFormField>
    <UFormField :label="t('reports.search')"><UInput v-model="search" icon="i-lucide-search" /></UFormField>
    <UButton :loading="downloading" :disabled="!validDate || isFetching || isError" icon="i-lucide-download" @click="download">{{ t('reports.download') }}</UButton>
   </div>
   <p>{{ t('reports.exportHint') }}</p>
   <UAlert v-if="!validDate" color="error" :title="t('reports.invalidDate')" />
   <UAlert v-else-if="isError || downloadError" color="error" :title="t('reports.error')"><template #actions><UButton @click="store.refetch()">{{ t('reports.retry') }}</UButton></template></UAlert>
   <p v-else-if="isPending">{{ t('reports.loading') }}</p>
   <template v-else>
    <MembersMemberPresenceLegend v-if="kind === 'belts'" />
    <p aria-live="polite">{{ t('reports.count', { count: rows.length }) }}</p>
    <p v-if="!rows.length">{{ t('reports.empty') }}</p>
    <ul v-else class="report-list">
     <li v-for="row in rows" :key="row.id" class="report-row">
      <NuxtLink :to="`/mentor/member/${row.memberId}`" class="report-member">
       <MemberPhoto v-if="kind === 'belts' && photos[row.id]" :member="photos[row.id]!" size="sm" :borderColor="borders[row.id]" />
       <span>{{ row.nameFirst }} {{ row.nameLast }}</span>
      </NuxtLink>
      <template v-if="kind === 'belts'">
       <BeltColor :belt="row.belt" />
       <time :datetime="row.awarded ?? undefined">{{ row.awarded?.slice(0, 10) }}</time>
       <p v-if="row.notes" class="report-notes">{{ row.notes }}</p>
      </template>
      <span v-else class="report-email">{{ row.email }}</span>
     </li>
    </ul>
   </template>
  </template>
 </UDashboardPanel>
</template>

<style scoped lang="scss">
.report-controls { display: flex; flex-wrap: wrap; align-items: end; gap: var(--ui-spacing, 1rem); }
.report-list { list-style: none; padding: 0; }
.report-row { display: flex; flex-wrap: wrap; align-items: center; gap: 1rem; padding: 1rem 0; border-bottom: 1px solid var(--ui-border); }
.report-member { display: flex; align-items: center; gap: 0.75rem; color: var(--ui-primary); }
.report-notes { flex-basis: 100%; white-space: pre-wrap; overflow-wrap: anywhere; }
.report-email { overflow-wrap: anywhere; }
</style>
