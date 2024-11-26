import { useQuery } from "@tanstack/vue-query";
import { computed } from "vue";
import type { ApiResponse, SelectOption } from "~~/shared/types";

export function useTeamsStore() {
	/**
	 * Teams Query
	 */
	const {
		data: Teams,
		isLoading,
		isError,
		error,
	} = useQuery({
		queryKey: ["teams"],
		queryFn: async () => {
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
