import { CreateDbTableStore } from "../utils/CreateDbTableStore";

/**
 * Auto-updating store of Teams data
 */
export function useTeamsStore() {
	const teamsStore = CreateDbTableStore<TeamModel>({
		tableName: "teams",
		getLabel: (team: TeamModel) => ({
			value: team.id,
			label: team.teamName,
		}),
	});

	return teamsStore;
}
