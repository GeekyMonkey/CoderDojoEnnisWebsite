import baseDbTableStore from "./baseDbTableStore";

/**
 * Auto-updating store of Teams data
 */
export function useTeamsStore() {
	const teamsStore = baseDbTableStore<TeamModel>({
		tableName: "teams",
		getLabel: (team: TeamModel) => team.teamName,
	});

	return {
		...teamsStore,
		Teams: teamsStore.Items,
	};
}
