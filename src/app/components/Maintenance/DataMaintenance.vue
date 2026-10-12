<script setup lang="ts">
import { computed, ref, type ComputedRef, type Ref } from "vue";
import { useDataMaintenanceStore } from "~/stores/useDataMaintenanceStore";
import { dataMaintenanceReportSchema, type DataMaintenanceAction, type DataMaintenanceReport } from "#shared/types/DataMaintenance";

const props: { action: DataMaintenanceAction } = defineProps<{ action: DataMaintenanceAction }>();
const { t, d }: { t: (key: string, values?: Record<string, string | number>) => string; d: (value: Date) => string } = useI18n();
const store: ReturnType<typeof useDataMaintenanceStore> = useDataMaintenanceStore(props.action);
const review: Ref<DataMaintenanceReport | null> = ref(null);
const result: Ref<DataMaintenanceReport | null> = ref(null);
const failed: Ref<boolean> = ref(false);
const confirmed: Ref<boolean> = ref(false);
const limit: Ref<number> = ref(50);
const displayed: ComputedRef<DataMaintenanceReport | null> = computed((): DataMaintenanceReport | null => review.value ?? store.data.value);
const rows: ComputedRef<DataMaintenanceReport["candidates"]> = computed((): DataMaintenanceReport["candidates"] => displayed.value?.candidates.slice(0, limit.value) ?? []);
const changed: ComputedRef<boolean> = computed((): boolean => Boolean(review.value && review.value.revision !== store.data.value?.revision));
const empty: ComputedRef<boolean> = computed((): boolean => !displayed.value?.candidates.length);
const description: ComputedRef<string> = computed((): string => t(`dataMaintenance.${props.action}Description`));
const cutoffLabel: ComputedRef<string> = computed((): string => displayed.value ? d(new Date(`${displayed.value.cutoff}T12:00:00`)) : "");

/** Capture exactly the preview shown to the mentor before allowing confirmation. */
function beginReview(): void {
 if (!store.data.value || store.isSaving.value) return;
 review.value = dataMaintenanceReportSchema.parse(store.data.value); confirmed.value = false; failed.value = false; result.value = null;
}
/** Cancel the pending review and show the latest server preview. */
function cancel(): void { review.value = null; confirmed.value = false; }
/** Apply the reviewed snapshot and retain actual result counts after query invalidation. */
async function submit(): Promise<void> {
 if (!review.value || !confirmed.value || changed.value || store.isSaving.value) return;
 try { failed.value = false; result.value = await store.apply(review.value); cancel(); }
 catch { failed.value = true; cancel(); }
}
</script>

<template>
 <section class="DataMaintenance">
  <p>{{ description }}</p>
  <p v-if="action === 'members' && displayed">{{ t('dataMaintenance.cutoff', { date: cutoffLabel }) }}</p>
  <UAlert v-if="failed || store.isError.value" color="error" :title="t('dataMaintenance.error')" />
  <UAlert v-if="changed" color="warning" :title="t('dataMaintenance.changed')" />
  <UAlert v-if="result" color="success" :title="t('dataMaintenance.completed')" :description="t('dataMaintenance.results', { coders: result.coders, parents: result.parents, registrations: result.registrations })" />
  <p v-if="store.isPending.value">{{ t('dataMaintenance.loading') }}</p>
  <template v-else-if="displayed && !store.isError.value">
   <p role="status">{{ t('dataMaintenance.results', { coders: displayed.coders, parents: displayed.parents, registrations: displayed.registrations }) }}</p>
   <p v-if="empty">{{ t('dataMaintenance.empty') }}</p>
   <div v-else class="CandidateTable">
    <table>
     <caption>{{ t('dataMaintenance.affected') }}</caption>
     <thead><tr><th scope="col">{{ t('dataMaintenance.name') }}</th><th v-if="action === 'members'" scope="col">{{ t('dataMaintenance.kind') }}</th><th scope="col">{{ t('dataMaintenance.lastAttendance') }}</th></tr></thead>
     <tbody><tr v-for="row in rows" :key="row.id"><td>{{ row.name }} <span v-if="row.archived">({{ t('dataMaintenance.archived') }})</span></td><td v-if="action === 'members'">{{ t(`dataMaintenance.${row.kind}`) }}</td><td>{{ row.lastAttendance ? d(new Date(`${row.lastAttendance}T12:00:00`)) : t('dataMaintenance.neverAttended') }}</td></tr></tbody>
    </table>
   </div>
   <UButton class="ShowMore" v-if="rows.length < displayed.candidates.length" variant="outline" @click="limit += 50">{{ t('maintenance.showMore') }}</UButton>
   <template v-if="review">
    <UCheckbox v-model="confirmed" :disabled="changed || store.isSaving.value" :label="t('dataMaintenance.confirmation')" />
    <div class="Actions"><UButton color="warning" :disabled="!confirmed || changed" :loading="store.isSaving.value" @click="submit">{{ t('dataMaintenance.apply') }}</UButton><UButton variant="outline" :disabled="store.isSaving.value" @click="cancel">{{ t('achievementReviews.cancel') }}</UButton></div>
   </template>
   <div v-else class="Actions"><UButton color="warning" :disabled="empty || store.isSaving.value" @click="beginReview">{{ t('dataMaintenance.review') }}</UButton><UButton variant="outline" :loading="store.isPending.value" :disabled="store.isSaving.value" @click="store.refresh">{{ t('dataMaintenance.refresh') }}</UButton></div>
  </template>
  <UButton v-if="store.isError.value" variant="outline" @click="store.refresh">{{ t('dataMaintenance.refresh') }}</UButton>
 </section>
</template>

<style scoped lang="scss">
.DataMaintenance { display: grid; gap: var(--ui-space, 1rem); max-width: 60rem; }
.CandidateTable { overflow: auto; max-height: min(26rem, 50vh); }
.ShowMore { justify-self: start; }
th { position: sticky; top: 0; background: var(--ui-bg); }
table { width: 100%; table-layout: fixed; border-collapse: collapse; }
th:first-child { width: 40%; }
th:last-child { width: 35%; }
caption { text-align: start; font-weight: 600; padding-block: .5rem; }
th, td { text-align: start; padding: .5rem; border-bottom: 1px solid var(--ui-border); overflow-wrap: anywhere; }
.Actions { display: flex; flex-wrap: wrap; gap: .5rem; }
</style>
