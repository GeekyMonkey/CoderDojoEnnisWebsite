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
			const response = await $fetch<ApiResponse<TeamModel[]>>(
				`/api/Teams/list?include_deleted=${includeDeleted}`,
			);
			if (!response.success) {
				throw new Error(response.error || "api error");
			}

			return response.data;
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
