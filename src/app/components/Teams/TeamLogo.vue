<script setup lang="ts">
	import { useTeamsStore } from "~/stores/useTeamsStore";
	import type { MemberModel } from "#shared/types/models/MemberModel";

	const props = defineProps<{
		for: MemberModel | TeamModel | null;
		size: "sm" | "md" | "lg";
	}>();

	const { TeamLogoUrl } = useUiConfig();
	const { TeamsById } = useTeamsStore();

	const src = computed<string | null>(() => {
		let src: string | null = null;
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
				src = TeamLogoUrl(team.id);
			}
		}
		return src;
	});
</script>

<template>
	<div class="TeamLogo" :class="`Size_${props.size}`">
		<img v-if="!!src" :src="src" />
	</div>
</template>

<style>
	.TeamLogo {
		&.Size_sm {
			width: 32px;
			height: 32px;
		}
		&.Size_md {
			width: 48px;
			height: 48px;
		}
		&.Size_lg {
			width: 64px;
			height: 64px;
		}
		img {
			width: 100%;
			height: 100%;
			object-fit: contain;
		}
	}
</style>
