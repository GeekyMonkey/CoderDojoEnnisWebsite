import { useQuery, useQueryClient } from "@tanstack/vue-query";
import type { MemberBeltModel } from "~~/shared/types/models/MemberBeltModel";
import { UseSupabaseRealtimeAllTables } from "../composables/UseSupabaseRealtimeAllTables";

interface UseMemberBeltsStoreResult {
	MemberBelts: Ref<MemberBeltModel[]>;
	isLoading: Ref<boolean>;
	isError: Ref<boolean>;
	error: Ref<unknown>;
	refetch: () => void;
}

let _store: UseMemberBeltsStoreResult | null = null;

/**
 * Client-side store for member_belts with realtime invalidation.
 */
export function useMemberBeltsStore(): UseMemberBeltsStoreResult {
	if (_store) {
		return _store;
	}

	const queryClient = useQueryClient();

	const { data, isLoading, isError, error, refetch } = useQuery<
		MemberBeltModel[]
	>({
		queryKey: ["memberBelts"],
		queryFn: async ({ signal }) => {
			const response = await $fetch<ApiResponse<MemberBeltModel[]>>(
				"/api/memberBelts/list",
				{ signal },
			);
			if (!response.success) {
				throw new Error(response.error || "Failed to load member belts");
			}
			return response.data;
		},
		staleTime: 1000 * 60 * 5,
		refetchOnWindowFocus: false,
	});

	// Realtime invalidation
	const { events: allEvents } = UseSupabaseRealtimeAllTables();
	const TARGET_TABLE = "member_belts";
	allEvents.on("INSERT", (evt) => {
		if (evt.table === TARGET_TABLE) {
			queryClient.invalidateQueries({ queryKey: ["memberBelts"] });
		}
	});
	allEvents.on("UPDATE", (evt) => {
		if (evt.table === TARGET_TABLE) {
			queryClient.invalidateQueries({ queryKey: ["memberBelts"] });
		}
	});
	allEvents.on("DELETE", (evt) => {
		if (evt.table === TARGET_TABLE) {
			queryClient.invalidateQueries({ queryKey: ["memberBelts"] });
		}
	});

	_store = {
		MemberBelts: computed(() => data.value || []) as Ref<MemberBeltModel[]>,
		isLoading: isLoading as Ref<boolean>,
		isError: isError as Ref<boolean>,
		error: error as Ref<unknown>,
		refetch: () => refetch(),
	};

	return _store;
}
