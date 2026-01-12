import baseDbTableStore from "./baseDbTableStore";

/**
 * Auto-updating store of Teams data
 */
export function useTeamsStore() {
	const teamsStore = baseDbTableStore<TeamModel>({
		tableName: "teams",
		getLabel: (team: TeamModel) => team.teamName,
	});

	const TeamsById = computed<Record<string, TeamModel>>(() => {
		const byId: Record<string, TeamModel> = {};
		teamsStore.Items.value?.forEach((team) => {
			byId[team.id] = team;
		});
		return byId;
	});

	return {
		...teamsStore,
		Teams: teamsStore.Items,
		TeamsById,
	};
}
