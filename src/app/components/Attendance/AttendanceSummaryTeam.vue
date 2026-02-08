<script setup lang="ts">
	import type { MemberModel } from "#shared/types/models/MemberModel";
	import type { TeamModel } from "#shared/types/models/TeamModel";
	import TeamLogo from "../Teams/TeamLogo.vue";
	import { useTeamsStore } from "~/stores/useTeamsStore";

	const props = defineProps<{
		teamId: string | null;
		teamName: string;
		teamColor: string | null;
		members: MemberModel[];
	}>();

	const { TeamsById } = useTeamsStore();

	// Determine header background color, falling back to a neutral color if none provided
	const headerBackgroundColor = computed(() => {
		return props.teamColor || "rgb(100, 100, 100)";
	});

	// Determine if text should be light or dark based on background brightness
	const headerTextColor = computed(() => {
		if (!props.teamColor) {
			return "white";
		}
		// Simple brightness calculation for hex color
		const hex = props.teamColor.replace("#", "");
		const r = parseInt(hex.substring(0, 2), 16);
		const g = parseInt(hex.substring(2, 4), 16);
		const b = parseInt(hex.substring(4, 6), 16);
		const brightness = (r * 299 + g * 587 + b * 114) / 1000;
		return brightness > 128 ? "black" : "white";
	});

	// Get the team object for TeamLogo component
	const team = computed<TeamModel | null>(() => {
		return props.teamId ? TeamsById.value[props.teamId] || null : null;
	});

	// Resolve which logo to show for the header
	const logoFor = computed<TeamModel | "MENTORS" | "UNASSIGNED" | null>(() => {
		if (team.value) {
			return team.value;
		}
		if (props.teamName === "Mentors") {
			return "MENTORS";
		}
		if (props.teamName === "Unassigned") {
			return "UNASSIGNED";
		}
		return null;
	});

	// Sort members alphabetically by name
	const sortedMembers = computed(() => {
		return [...props.members].sort((a, b) => {
			const nameA =
				`${a.nameFirst || ""} ${a.nameLast || ""}`.trim() || a.login || "";
			const nameB =
				`${b.nameFirst || ""} ${b.nameLast || ""}`.trim() || b.login || "";
			return nameA.localeCompare(nameB);
		});
	});
</script>

<template>
	<div class="AttendanceSummaryTeam">
		<div
			class="TeamHeader"
			:style="{
				backgroundColor: headerBackgroundColor,
				color: headerTextColor,
			}"
		>
			<TeamLogo v-if="logoFor" :for="logoFor" size="sm" class="TeamLogo" />
			<h3 class="TeamName">{{ teamName }}</h3>
		</div>
		<div class="TeamBody">
			<div v-if="members.length === 0" class="EmptyState">
				{{ $t("attendance.noMembersSignedIn") }}
			</div>
			<TransitionGroup v-else name="member-enter" tag="div" class="MembersList">
				<MemberAvatar
					v-for="member in sortedMembers"
					:key="member.id"
					:member="member"
					size="sm"
					link-to="NEW_TAB"
					class="MemberAvatarItem"
				/>
			</TransitionGroup>
		</div>
	</div>
</template>

<style scoped lang="scss">
	.AttendanceSummaryTeam {
		border: 1px solid var(--ui-border);
		border-radius: 0.5rem;
		overflow: hidden;
		background-color: var(--ui-bg-elevated);
		display: inline-block;
		min-width: min(250px, 25vw);
	}

	.TeamHeader {
		padding: calc(var(--spacing) * 2);
		font-weight: 600;
		display: flex;
		align-items: center;
		gap: calc(var(--spacing) * 1);
	}

	.TeamLogo {
		margin-right: 0.5rem;
		flex-shrink: 0;
	}

	.TeamName {
		margin: 0;
		font-size: 1rem;
		line-height: 1.4;
		flex: 1 1 0;
		min-width: 0;
		word-wrap: break-word;
		overflow-wrap: break-word;
		hyphens: auto;
		inline-size: min-content;
		line-height: 1;
	}

	.TeamBody {
		padding: calc(var(--spacing) * 2);
		min-height: 80px;
		display: flex;
		align-items: center;
		justify-content: flex-start;
	}

	.EmptyState {
		color: var(--ui-text-muted);
		font-size: 0.875rem;
		width: 100%;
		text-align: center;
	}

	.MembersList {
		display: grid;
		gap: calc(var(--spacing) * 1);
		grid-template-columns: repeat(10, min-content);
		grid-auto-flow: row;
		justify-content: start;
		width: 100%;
	}

	.MemberAvatarItem {
		flex-shrink: 0;
	}

	/* Member entrance animation */
	.member-enter-enter-active {
		animation: member-pop-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
	}

	@keyframes member-pop-in {
		0% {
			transform: scale(0);
			opacity: 0;
			filter: drop-shadow(0 0 0px transparent);
		}
		50% {
			transform: scale(1.6);
			filter: drop-shadow(0 0 12px rgba(255, 215, 0, 0.8));
		}
		70% {
			transform: scale(0.9);
		}
		100% {
			transform: scale(1);
			opacity: 1;
			filter: drop-shadow(0 0 0px transparent);
		}
	}
</style>
