<script setup lang="ts">
 import { computed, ref, type ComputedRef } from "vue";
 import { z } from "zod";
 import PrintIdSheet from "~/components/Printing/PrintIdSheet.vue";
 import TeamCard from "~/components/Printing/TeamCard.vue";
 import { useTeamMaintenanceStore } from "~/stores/useTeamMaintenanceStore";
 import { useMemberMaintenanceStore } from "~/stores/useMemberMaintenanceStore";
 import type { TeamModel } from "#shared/types/models/TeamModel";
 import type { MemberModel } from "#shared/types/models/MemberModel";
 import { compareMemberNames } from "#shared/utils/MemberNames";
 definePageMeta({ layout: false });
 const route: ReturnType<typeof useRoute> = useRoute();
 const { t } = useI18n();
 const teams: ReturnType<typeof useTeamMaintenanceStore> = useTeamMaintenanceStore();
 const members: ReturnType<typeof useMemberMaintenanceStore> = useMemberMaintenanceStore();
 const ready: import("vue").Ref<boolean> = ref(false);
 type PrintSelection = { teamId: string; kind: "ids" | "card" };
 type PrintStyle = { key: string; textContent: string };
 type PrintHead = { style: PrintStyle[] };
 const ROUTE_SCHEMA: z.ZodType<PrintSelection> = z.strictObject({ teamId: z.uuid(), kind: z.enum(["ids", "card"]) });
 const selection: ComputedRef<z.ZodSafeParseResult<PrintSelection>> = computed((): z.ZodSafeParseResult<PrintSelection> => ROUTE_SCHEMA.safeParse({ teamId: (route.params as Record<string, string | string[]>).teamId, kind: route.query.kind ?? "card" }));
 const team: ComputedRef<TeamModel | null> = computed((): TeamModel | null => { const selected: typeof selection.value = selection.value; return selected.success ? teams.teams.value.find((value: TeamModel): boolean => value.id === selected.data.teamId) ?? null : null; });
 const assigned: ComputedRef<MemberModel[]> = computed((): MemberModel[] => (members.data.value?.members ?? []).filter((member: MemberModel): boolean => member.teamId === team.value?.id).sort(compareMemberNames));
 const memberPages: ComputedRef<MemberModel[][]> = computed((): MemberModel[][] => { const pages: MemberModel[][] = []; for (let index: number = 0; index < assigned.value.length; index += 8) pages.push(assigned.value.slice(index, index + 8)); return pages.length ? pages : [[]]; });
 const kind: ComputedRef<"ids" | "card"> = computed((): "ids" | "card" => selection.value.success ? selection.value.data.kind : "card");
 const loading: ComputedRef<boolean> = computed((): boolean => teams.isPending.value || members.isPending.value);
 const failed: ComputedRef<boolean> = computed((): boolean => teams.isError.value || members.isError.value || !selection.value.success);
 const printable: ComputedRef<boolean> = computed((): boolean => !loading.value && !failed.value && Boolean(team.value) && (kind.value === "card" || (assigned.value.length > 0 && ready.value)));
 /** Track each card's QR and award readiness before enabling printing. */
 function cardReady(value: boolean): void { ready.value = value; }
 /** Print the prepared layout after all required card data has loaded. */
 function print(): void { if (printable.value) window.print(); }
 useHead((): PrintHead => ({ style: [{ key: "print-page-size", textContent: kind.value === "card" ? "@page { size: A6 landscape; margin: 0; }" : "@page { size: A4; margin: 4mm; }" }] }));
</script>
<template><main class="PrintPreview"><div class="PrintToolbar"><UButton v-if="team" :to="`/mentor/maintenance/team/${team.id}`" variant="outline">{{ team.teamName }}</UButton><UButton icon="i-lucide-printer" :disabled="!printable" @click="print">{{ t('teams.print') }}</UButton></div><p v-if="loading">{{ t('profile.loading') }}</p><UAlert v-else-if="failed || !team" color="error" :title="t('teams.loadError')" /><template v-else><div v-if="kind === 'ids'" class="IdCards"><PrintIdSheet v-if="members.data.value" :members="assigned" :data="members.data.value" @ready="cardReady" /><p v-if="!assigned.length">{{ t('teams.noMembers') }}</p></div><div v-else class="TeamCards"><TeamCard v-for="(page, index) in memberPages" :key="index" :team="team" :members="page" /></div></template></main></template>
<style scoped lang="scss">
 .PrintPreview { padding: calc(var(--spacing) * 5); overflow-x: auto; } .PrintToolbar { display: flex; gap: calc(var(--spacing) * 3); margin-bottom: calc(var(--spacing) * 5); } .TeamCards { display: grid; gap: 4mm; width: fit-content; } .IdCards { display: grid; gap: 4mm; width: fit-content; }
 @media (max-width: 50rem) { .IdCards { grid-template-columns: minmax(0, 1fr); width: 100%; } .TeamCards { width: 100%; } .TeamCards :deep(.TeamCard) { max-width: 100%; } }
 @media print { .PrintPreview { padding: 0; overflow: visible; } .PrintToolbar { display: none; } .TeamCards { gap: 0; width: fit-content; } .TeamCards :deep(.TeamCard) { break-after: page; max-width: none; } .TeamCards :deep(.TeamCard:last-child) { break-after: auto; } .IdCards { width: fit-content; } }
</style>
