import { useQuery, useQueryClient } from "@tanstack/vue-query";
import { computed } from "vue";
import type { ApiResponse, SelectOption } from "~~/shared/types";
import { UseSupabaseRealtimeTable } from "./UseSupabaseRealtimeTable";

/**
 * Auto-updaing store of Teams data
 */
export function useTeamsStore() {
	console.log("[TeamsStore] Initializing");

	const queryClient = useQueryClient();
	const tableName: string = "teams";

	/**
	 * Teams Query
	 */
	const {
		data: Teams,
		isLoading,
		isError,
		error,
	} = useQuery<TeamModel[]>({
		queryKey: [tableName],
		queryFn: async () => {
			console.log("[TeamsStore] Fetching Teams");
			const includeDeleted: boolean = false;
			const response = await $fetch<ApiResponse<TeamModel[]>>(
				`/api/Teams/list?include_deleted=${includeDeleted}`,
			);
			if (!response.success) {
				throw new Error(response.error || "api error");
			}

			return response.data;
		},
	});

	const { events } = UseSupabaseRealtimeTable({ table: "teams" });
	events?.on("INSERT", (data) => {
		queryClient.invalidateQueries({ queryKey: [tableName] });
	});
	events?.on("UPDATE", (data) => {
		queryClient.invalidateQueries({ queryKey: [tableName] });
	});
	events?.on("DELETE", (data) => {
		// Update the cached data to filter out the team that was deleted
		queryClient.setQueryData<TeamModel[]>([tableName], (Teams) =>
			Teams?.filter((team) => team.id !== data.id),
		);
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
