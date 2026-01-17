<script setup lang="ts">
  import { useTeamsStore } from "~/stores/useTeamsStore";
  import type { MemberModel } from "~~/shared/types/models/MemberModel";
  import type { TeamModel } from "~~/shared/types/models/TeamModel";

  const props = defineProps<{
    for: MemberModel | TeamModel | null;
    size: "sm" | "md" | "lg";
  }>();

  const { TeamsById } = useTeamsStore();

  const team = computed<TeamModel | null>(() => {
    if (!!props.for) {

      let team: TeamModel | null = null;

      // Is this a team or member
      if ((props.for as TeamModel).teamName) {
        team = props.for as TeamModel;
      } else {
        const member = props.for as MemberModel;
        if (member.teamId) {
          team = TeamsById.value[member.teamId] || null;
        }
      }

      if (team) {
        return team;
      }
    }
    return null;
  });

</script>

<template>
  <div class="TeamCard" :class="`Size_${props.size}`" >
    <div class="TeamCardItems" v-if="!!team">
      <TeamLogo :for="team" :size="props.size" />
      <div class="TeamName">{{ team.teamName }}</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .TeamCard {
    .TeamCardItems {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border: solid 1px black;
      background: linear-gradient(#fff, #888);
      justify-content: center;
      font-weight: bold;
    }

    &.Size_sm {
      .TeamName {
        font-size: .75rem;
      }
    }
    &.Size_md {
      .TeamName {
        font-size: 1rem;
      } 
    }
    &.Size_lg {
      .TeamName {
        font-size: 1.5rem;
      }
    }
  
  }   
</style>