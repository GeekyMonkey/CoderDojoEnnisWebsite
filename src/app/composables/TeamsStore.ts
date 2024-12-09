import { useQuery } from "@tanstack/vue-query";
import { computed, ref } from "vue";
import type { ApiResponse, SelectOption } from "~~/shared/types";

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
			const response = await $fetch<ApiResponse<TeamModel[]>>(
				`/api/Teams/list?include_deleted=${includeDeleted}`,
			);
			if (!response.success) {
				throw new Error(response.error || "api error");
			}
			const teamsSorted = response.data.sort((a, b) =>
				a.teamName.localeCompare(b.teamName),
			);

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
