import { CreateDbTableStore } from "../utils/CreateDbTableStore";

/**
 * Auto-updating store of Teams data
 */
export function useTeamsStore() {
	const teamsStore = CreateDbTableStore<TeamModel>({
		tableName: "teams",
		getLabel: (team: TeamModel) => team.teamName,
	});

	return {
		...teamsStore,
		Teams: teamsStore.Items,
	};
}
