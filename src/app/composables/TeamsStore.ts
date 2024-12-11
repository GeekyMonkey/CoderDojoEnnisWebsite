import { useQuery } from "@tanstack/vue-query";
import { computed, ref } from "vue";
import { coderdojoData } from "~/utils/supabaseClient";
import type { ApiResponse, SelectOption } from "~~/shared/types";
import { TeamModelSchema } from "~~/shared/types/models/TeamModel";

export function useTeamsStore() {
	console.log("[TeamsStore] Initializing");

	/**
	 * Teams Query
	 */
	const {
		data: Teams,
		isLoading,
		isError,
		error,
	} = useQuery<TeamModel[]>({
		queryKey: ["teams"],
		queryFn: async () => {
			console.log("[TeamsStore] Fetching Teams");
			const includeDeleted: boolean = false;
			const { data, error } = await coderdojoData
				.from("teams")
				.select("*")
				.eq("deleted", includeDeleted);

			if (error) {
				throw new Error(error.message || "api error");
			}

			let teamsSorted: TeamModel[] = [];
			try {
				const entitiesConverted = data.map((d) => {
					const temp = {
						...d,
						teamName: d.team_name,
					};
					delete temp.team_name;
					return temp;
				});
				debugger;
				const validatedData: TeamModel[] =
					TeamModelSchema.array().parse(entitiesConverted);
				teamsSorted = validatedData.sort((a, b) =>
					a.teamName.localeCompare(b.teamName),
				);
			} catch (error) {
				console.error("[TeamsStore] Error sorting teams", error);
				debugger;
			}

			return teamsSorted;
		},
	});

	/**
	 * Dropdown Options for Teams
	 */
	const TeamOptions = computed<SelectOption[]>(() => {
		return (Teams.value || []).map((team) => ({
			value: team.id,
			label: team.teamName,
		}));
	});

	return {
		Teams,
		TeamOptions,
		isLoading,
		isError,
		error,
	};
}
