<script setup lang="ts">
 import { ref, computed, type Ref, type ComputedRef } from "vue";
 import { teamSearchSchema } from "#shared/types/TeamMaintenance";
 import type { TeamModel } from "#shared/types/models/TeamModel";
 import { useTeamMaintenanceStore } from "~/stores/useTeamMaintenanceStore";
 const { t } = useI18n();
 const store: ReturnType<typeof useTeamMaintenanceStore> = useTeamMaintenanceStore();
 const { teams, isPending, isError, isSaving } = store;
 const search: Ref<string> = ref("");
 const creating: Ref<boolean> = ref(false);
 const visible: ComputedRef<TeamModel[]> = computed((): TeamModel[] => teams.value.filter((team: TeamModel): boolean => team.teamName.toLocaleLowerCase().includes(teamSearchSchema.parse(search.value).toLocaleLowerCase())));
 /** Open the created team's display page. */
 async function created(team: TeamModel): Promise<void> { creating.value = false; await navigateTo(`/mentor/maintenance/team/${team.id}`); }
</script>
<template>
 <UDashboardPanel id="mentor-maintenance-teams">
  <template #header><DashboardHeading :pageTitle="t('teams.plural')" /></template>
  <template #body><div class="TeamDirectory">
   <div class="TeamToolbar"><UInput v-model="search" :placeholder="t('teams.search')" :aria-label="t('teams.search')" maxlength="200" /><UButton @click="creating = true">{{ t('teams.create') }}</UButton></div>
   <UPageCard v-if="creating" :title="t('teams.create')"><TeamForm :team="null" :saving="isSaving" :save="store.create" @saved="created" @cancel="creating = false" /></UPageCard>
   <p v-if="isPending">{{ t('profile.loading') }}</p><UAlert v-else-if="isError" color="error" :title="t('teams.loadError')" />
   <ul v-else class="TeamList"><li v-for="team in visible" :key="team.id"><NuxtLink :to="`/mentor/maintenance/team/${team.id}`"><TeamLogo :for="team" size="md" /><ColourSwatch :hexCode="team.hexcode" /><span>{{ team.teamName }}</span></NuxtLink></li></ul>
   <p v-if="!isPending && !isError && !visible.length">{{ t('teams.empty') }}</p>
  </div></template>
 </UDashboardPanel>
</template>
<style scoped lang="scss">
 .TeamDirectory { display: grid; gap: calc(var(--spacing) * 5); padding: calc(var(--spacing) * 4); max-width: 70rem; }
 .TeamToolbar { display: flex; flex-wrap: wrap; gap: calc(var(--spacing) * 3); }
 .TeamList { list-style: none; padding: 0; display: grid; gap: calc(var(--spacing) * 3); }
 .TeamList a { display: flex; align-items: center; gap: calc(var(--spacing) * 3); padding: calc(var(--spacing) * 3); border: 1px solid var(--ui-border); border-radius: var(--radius); }
</style>
