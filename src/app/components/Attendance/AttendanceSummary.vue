<script setup lang="ts">
	import type { MemberModel } from "#shared/types/models/MemberModel";
	import { useMemberAttendanceStore } from "~/stores/useMemberAttendanceStore";
	import { useMembersStore } from "~/stores/useMembersStore";
	import { useTeamsStore } from "~/stores/useTeamsStore";

	// Fetch required stores
	const { TodaysDate, useSessionAttendanceForDate } =
		useMemberAttendanceStore();
	const { MembersById } = useMembersStore();
	const { TeamsById } = useTeamsStore();

	/**
	 * Query attendance for today's date
	 */
	const { data: currentSessionAttendance } =
		useSessionAttendanceForDate(TodaysDate);

	/**
	 * Get member IDs signed in for today
	 */
	const signedInMemberIds = computed<string[]>(
		() => currentSessionAttendance.value?.memberIds || [],
	);

	/**
	 * Get detailed member objects for signed-in members
	 */
	const signedInMembers = computed<MemberModel[]>(() => {
		return signedInMemberIds.value
			.map((id) => MembersById.value[id] as MemberModel)
			.filter((m) => m && !m.deleted);
	});

	/**
	 * Get mentors by filtering signed-in members for those with isMentor flag
	 */
	const mentors = computed<MemberModel[]>(() => {
		return signedInMembers.value.filter((m) => m?.isMentor);
	});

	/**
	 * Get coders by filtering out mentors from signed-in members
	 */
	const coders = computed(() => {
		return signedInMembers.value.filter((m) => !m?.isMentor);
	});

	/**
	 * Group coders by team
	 */
	const membersByTeam = computed(() => {
		const groups: Record<string, MemberModel[]> = {};
		for (const member of coders.value) {
			const teamId = member.teamId || "no-team";
			if (!groups[teamId]) {
				groups[teamId] = [];
			}
			groups[teamId].push(member);
		}
		return groups;
	});

	/**
	 * Build a list of teams to display (teams with members, with team info included)
	 */
	const teamsToDisplay = computed(() => {
		const result: Array<{
			teamId: string;
			teamName: string;
			teamColor: string | null;
			members: MemberModel[];
		}> = [];

		for (const [teamId, members] of Object.entries(membersByTeam.value)) {
			if (members.length > 0) {
				const team = teamId !== "no-team" ? TeamsById.value[teamId] : null;
				result.push({
					teamId,
					teamName: team?.teamName || "Unassigned",
					teamColor: team?.hexcode || null,
					members,
				});
			}
		}

		return result.sort((a, b) => {
			const aIsUnassigned = a.teamName === "Unassigned";
			const bIsUnassigned = b.teamName === "Unassigned";
			if (aIsUnassigned && !bIsUnassigned) {
				return 1;
			}
			if (!aIsUnassigned && bIsUnassigned) {
				return -1;
			}
			return a.teamName.localeCompare(b.teamName);
		});
	});
</script>

<template>
	<div class="AttendanceSummary">
		<!-- Team cards - only visible when team has members present -->
		<AttendanceSummaryTeam
			v-for="team in teamsToDisplay"
			:key="team.teamId"
			:team-id="team.teamId === 'no-team' ? null : team.teamId"
			:team-name="team.teamName"
			:team-color="team.teamColor"
			:members="team.members"
		/>

		<!-- Mentors card - always visible -->
		<AttendanceSummaryTeam
			:team-id="null"
			team-name="Mentors"
			:team-color="null"
			:members="mentors"
		/>
	</div>
</template>

<style scoped lang="scss">
	.AttendanceSummary {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: calc(var(--spacing) * 2);
		width: 100%;
	}
</style>
