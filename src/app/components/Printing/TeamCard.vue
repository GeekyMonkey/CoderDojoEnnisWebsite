<script setup lang="ts">
 import { computed, type ComputedRef } from "vue";
 import type { TeamModel } from "#shared/types/models/TeamModel";
 import type { MemberModel } from "#shared/types/models/MemberModel";
 const props = defineProps<{ team: TeamModel; members: MemberModel[] }>();
 const stripe: ComputedRef<Record<string, string>> = computed((): Record<string, string> => ({ "--team-colour": /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(props.team.hexcode ?? "") ? props.team.hexcode as string : "transparent" }));
</script>
<template>
	<article class="TeamCard" :style="stripe">
	<div class="TeamStripe" />
	<header>
	<TeamLogo :for="team" size="lg" />
	<h1>{{ team.teamName }}</h1>
	</header>
	<ul>
	<li v-for="member in members" :key="member.id">
	<MemberAvatar :member="member" size="sm" linkTo="NONE" />
	<span>{{ member.nameFirst }} {{ member.nameLast }}</span>
	</li>
	</ul>
	</article>
	</template>
<style scoped lang="scss">
 .TeamCard { width: 148mm; min-height: 105mm; padding: 5mm; background: white; color: #111; break-inside: avoid; } .TeamStripe { height: 10mm; border: 1px solid #111; background: var(--team-colour); print-color-adjust: exact; } header { display: flex; align-items: center; gap: 5mm; margin-block: 3mm; } h1 { font-size: 8mm; font-weight: bold; overflow-wrap: anywhere; min-width: 0; } ul { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 3mm; padding: 0; list-style: none; } li { display: flex; align-items: center; gap: 3mm; font-size: 4.5mm; line-height: 1.15; overflow-wrap: anywhere; }
</style>
