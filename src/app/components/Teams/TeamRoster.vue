<script setup lang="ts">
 import type { TeamModel } from "#shared/types/models/TeamModel";
 import type { PublicMember } from "#shared/types/Coder";
 import TeamLogo from "./TeamLogo.vue";
 import MemberPhoto from "~/components/Members/MemberPhoto.vue";
 const props = defineProps<{team:TeamModel|null;members:PublicMember[];profileBase:string}>();
 const { t } = useI18n();
</script>
<template>
 <UPageCard :title="team?.teamName ?? t('teams.label')">
  <template v-if="team"><TeamLogo :for="team" size="lg" /><p class="TeamGoal">{{ team.goal || '—' }}</p><ul class="Roster"><li v-for="member in members" :key="member.id"><NuxtLink :to="`${profileBase}/${member.id}`"><MemberPhoto :member="member" size="sm" /><span>{{ member.nameFirst }} {{ member.nameLast }}</span></NuxtLink></li></ul></template>
  <p v-else>{{ t('coder.unassigned') }}</p>
 </UPageCard>
</template>
<style scoped lang="scss">
 .TeamGoal { white-space:pre-wrap; overflow-wrap:anywhere; } .Roster { display:grid; gap:calc(var(--spacing)*3); list-style:none; padding:0; } .Roster a { display:flex; align-items:center; gap:calc(var(--spacing)*3); } .Roster span { overflow-wrap:anywhere; }
</style>
