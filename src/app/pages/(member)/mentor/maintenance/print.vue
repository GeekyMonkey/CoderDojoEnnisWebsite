<script setup lang="ts">
import { computed, ref, type ComputedRef, type Ref } from "vue";
import { z } from "zod";
import PrintIdSheet from "~/components/Printing/PrintIdSheet.vue";
import BeltCertificate from "~/components/Printing/BeltCertificate.vue";
import { useMemberMaintenanceStore } from "~/stores/useMemberMaintenanceStore";
import { useAchievementReviewsStore } from "~/stores/useAchievementReviewsStore";
import { compareMemberNames } from "#shared/utils/MemberNames";
import type { MemberModel } from "#shared/types/models/MemberModel";
import type { AchievementReview } from "#shared/types/AchievementReview";
definePageMeta({ layout: false });
type Selection = { kind: "coders" | "mentors" | "member" | "certificate"; memberId?: string };
const SCHEMA: z.ZodType<Selection> = z.strictObject({ kind: z.enum(["coders", "mentors", "member", "certificate"]), memberId: z.uuid().optional() }).refine((value: Selection): boolean => ["member", "certificate"].includes(value.kind) === Boolean(value.memberId));
const route: ReturnType<typeof useRoute> = useRoute();
const { t } = useI18n();
const store: ReturnType<typeof useMemberMaintenanceStore> = useMemberMaintenanceStore();
const selection: ComputedRef<z.ZodSafeParseResult<Selection>> = computed((): z.ZodSafeParseResult<Selection> => SCHEMA.safeParse(route.query));
const certificate: ComputedRef<boolean> = computed((): boolean => selection.value.success && selection.value.data.kind === "certificate");
const certificateId: ComputedRef<string> = computed((): string => certificate.value && selection.value.success ? selection.value.data.memberId ?? "" : "");
const belts: ReturnType<typeof useAchievementReviewsStore> = useAchievementReviewsStore("belt", certificateId);
const members: ComputedRef<MemberModel[]> = computed((): MemberModel[] => {
 const selected: typeof selection.value = selection.value;
 if (!selected.success) return [];
 return (store.data.value?.members ?? []).filter((member: MemberModel): boolean => selected.data.memberId ? member.id === selected.data.memberId : selected.data.kind === "coders" ? member.isNinja && member.registeredCurrentTerm : member.isMentor).sort(compareMemberNames);
});
const award: ComputedRef<AchievementReview | null> = computed((): AchievementReview | null => [...(belts.data.value ?? [])].filter((value: AchievementReview): boolean => value.awarded !== null).sort((a: AchievementReview, b: AchievementReview): number => (b.awarded ?? 0) - (a.awarded ?? 0) || a.id.localeCompare(b.id))[0] ?? null);
const cardsReady: Ref<boolean> = ref(false);
const loading: ComputedRef<boolean> = computed((): boolean => store.isPending.value || (certificate.value && belts.isLoading.value));
const failed: ComputedRef<boolean> = computed((): boolean => !selection.value.success || store.isError.value || (certificate.value && belts.isError.value));
const printable: ComputedRef<boolean> = computed((): boolean => !loading.value && !failed.value && (certificate.value ? Boolean(award.value && members.value[0]?.isNinja) : cardsReady.value));
/** Open the browser print dialog only when the selected output is complete. */
function print(): void { if (printable.value) window.print(); }
useHead((): { style: { key: string; textContent: string }[] } => ({ style: [{ key: "print-page-size", textContent: certificate.value ? "@page { size: A4 landscape; margin: 10mm; }" : "@page { size: A4; margin: 4mm; }" }] }));
</script>
<template><main class="PrintPreview"><div class="PrintToolbar"><UButton to="/mentor/members" variant="outline">{{ t('nav.Members') }}</UButton><UButton icon="i-lucide-printer" :disabled="!printable" @click="print">{{ t('teams.print') }}</UButton></div><p v-if="loading">{{ t('profile.loading') }}</p><UAlert v-else-if="failed" color="error" :title="t('profile.loadError')" /><template v-else><template v-if="certificate"><BeltCertificate v-if="award && members[0]?.isNinja" :member="members[0]" :award="award" /><p v-else>{{ t('printing.noBelt') }}</p></template><template v-else><PrintIdSheet v-if="store.data.value" :members="members" :data="store.data.value" @ready="cardsReady = $event" /><p v-if="!members.length">{{ t('maintenance.noMembers') }}</p></template></template></main></template>
<style scoped lang="scss">
.PrintPreview { padding: calc(var(--spacing) * 5); overflow-x: auto; } .PrintToolbar { display: flex; gap: calc(var(--spacing) * 3); margin-bottom: calc(var(--spacing) * 5); }
@media print { .PrintPreview { padding: 0; overflow: visible; } .PrintToolbar { display: none; } }
</style>
