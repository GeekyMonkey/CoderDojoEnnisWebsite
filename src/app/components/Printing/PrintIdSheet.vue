<script setup lang="ts">
import { computed, reactive, type ComputedRef } from "vue";
import MemberIdCard from "~/components/Printing/MemberIdCard.vue";
import type { MemberModel } from "#shared/types/models/MemberModel";
import type { MaintenanceData } from "#shared/types/MemberMaintenance";
import type { TeamModel } from "#shared/types/models/TeamModel";
const props = defineProps<{ members: MemberModel[]; data: MaintenanceData }>();
const emit = defineEmits<{ ready: [value: boolean] }>();
const readyById: Record<string, boolean> = reactive({});
const teamsById: ComputedRef<Record<string, TeamModel>> = computed((): Record<string, TeamModel> => Object.fromEntries(props.data.teams.map((team: TeamModel): [string, TeamModel] => [team.id, team])));
const skillsById: ComputedRef<Record<string, string[]>> = computed((): Record<string, string[]> => {
 const names: Record<string, string> = Object.fromEntries(props.data.categories.map((category: MaintenanceData["categories"][number]): [string, string] => [category.id, category.categoryName ?? ""]));
 const result: Record<string, string[]> = {};
 for (const skill of props.data.skills) { const name: string = names[skill.badgeCategoryId] ?? ""; if (name) (result[skill.memberId] ??= []).push(name); }
 for (const values of Object.values(result)) values.sort((a: string,b: string): number => a.localeCompare(b));
 return result;
});
const ready: ComputedRef<boolean> = computed((): boolean => props.members.length > 0 && props.members.every((member: MemberModel): boolean => readyById[member.id] === true));
/** Track QR and award readiness for the full selected batch. */
function cardReady(id: string, value: boolean): void { readyById[id] = value; }
watch(ready, (value: boolean): void => emit("ready", value), { immediate: true });
</script>
<template><div class="IdSheet"><MemberIdCard v-for="member in members" :key="member.id" :member="member" :team="teamsById[member.teamId ?? ''] ?? null" :skillNames="skillsById[member.id] ?? []" @ready="cardReady" /></div></template>
<style scoped lang="scss">
.IdSheet { display: grid; grid-template-columns: repeat(2, 100mm); gap: 4mm; width: fit-content; }
@media (max-width: 50rem) { .IdSheet { grid-template-columns: minmax(0, 1fr); width: 100%; } }
@media print { .IdSheet { grid-template-columns: repeat(2, 100mm); gap: 2mm; width: fit-content; } }
</style>
