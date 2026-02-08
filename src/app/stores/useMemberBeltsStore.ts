import { useQuery, useQueryClient } from "@tanstack/vue-query";
import type { ComputedRef, Ref } from "vue";
import type { BeltModel } from "#shared/types/models/BeltModel";
import type { MemberModel } from "#shared/types/models/MemberModel";
import type {
	MemberBeltModel,
	MemberBeltWithBeltDetailModel,
} from "#shared/types/models/MemberBeltModel";
import { UseSupabaseRealtimeAllTables } from "~/composables/UseSupabaseRealtimeAllTables";
import { useBeltsStore } from "~/stores/useBeltsStore";
import { useMembersStore } from "~/stores/useMembersStore";
//import baseDbTableStore from "./baseDbTableStore";

export type PendingBeltApplication = {
	application: MemberBeltModel;
	member: MemberModel | null;
	belt: BeltModel | null;
	memberName: string;
	beltSortOrder: number;
};

/**
 * Client-side store for member_belts with realtime invalidation.
 */
export function useMemberBeltsStore() {
	// const store = baseDbTableStore<MemberBeltModel>({
	// 	apiPath: "memberBelts",
	// 	tableName: "member_belts",
	// 	getLabel: (item) => `${item.memberId}-${item.beltId}`,
	// });

	const queryClient: ReturnType<typeof useQueryClient> = useQueryClient();
	const membersStore = useMembersStore();
	const beltsStore = useBeltsStore();
	const MembersById: ComputedRef<Record<string, MemberModel>> =
		membersStore.MembersById;
	const BeltsById: ComputedRef<Record<string, BeltModel>> =
		beltsStore.BeltsById;

	/**
	 * Pending belt applications list.
	 */
	const pendingApplicationsQuery = useQuery<MemberBeltModel[]>({
		queryKey: ["memberBeltsPending"],
		queryFn: async ({ signal }) => {
			const response = await $fetch<ApiResponse<MemberBeltModel[]>>(
				"/api/memberBelts/pending",
				{ signal },
			);
			if (!response.success) {
				throw new Error(response.error || "api error");
			}
			return response.data;
		},
		staleTime: 1000 * 60,
		refetchOnWindowFocus: false,
	});
	const pendingApplicationsData: Ref<MemberBeltModel[] | undefined> =
		pendingApplicationsQuery.data;
	const isPendingApplicationsLoading: Ref<boolean> =
		pendingApplicationsQuery.isLoading;
	const isPendingApplicationsError: Ref<boolean> =
		pendingApplicationsQuery.isError;
	const pendingApplicationsError: Ref<unknown> = pendingApplicationsQuery.error;

	/**
	 * Latest awarded belt per member.
	 */
	const latestBeltsQuery = useQuery<MemberBeltModel[]>({
		queryKey: ["memberBeltsLatest"],
		queryFn: async ({ signal }) => {
			const response = await $fetch<ApiResponse<MemberBeltModel[]>>(
				"/api/memberBelts/latest",
				{ signal },
			);
			if (!response.success) {
				throw new Error(response.error || "api error");
			}
			return response.data;
		},
		staleTime: 1000 * 60,
		refetchOnWindowFocus: false,
	});
	const latestBeltsData: Ref<MemberBeltModel[] | undefined> =
		latestBeltsQuery.data;

	/**
	 * Build a query for a member's belt history.
	 */
	const getMemberBeltsByMemberIdQuery = (
		memberId: string,
	): ReturnType<typeof useQuery<MemberBeltWithBeltDetailModel[]>> => {
		const isEnabled: boolean = Boolean(memberId);
		return useQuery<MemberBeltWithBeltDetailModel[]>({
			queryKey: ["memberBeltsByMemberId", memberId],
			queryFn: async ({ signal }) => {
				const response = await $fetch<
					ApiResponse<MemberBeltWithBeltDetailModel[]>
				>("/api/memberBelts/byMemberId", {
					method: "GET",
					signal,
					query: { memberId },
				});
				if (!response.success) {
					throw new Error(response.error || "api error");
				}
				return response.data;
			},
			staleTime: 1000 * 60,
			enabled: isEnabled,
			refetchOnWindowFocus: false,
		});
	};

	/**
	 * Build a display name for a member.
	 */
	const getMemberName = (member: MemberModel | null): string => {
		if (!member) {
			return "";
		}
		const first = member.nameFirst ?? "";
		const last = member.nameLast ?? "";
		return `${first} ${last}`.trim() || member.login || "";
	};

	/**
	 * Map of memberId to their latest awarded MemberBeltModel
	 */
	const MembersLatestBeltsByMemberId = computed(() => {
		const map: Record<string, MemberBeltModel> = {};
		const items: MemberBeltModel[] = latestBeltsData.value || [];
		for (const memberBelt of items) {
			map[memberBelt.memberId] = memberBelt;
		}
		return map;
	});

	/**
	 * Sorted list of pending belt applications with related data.
	 */
	const PendingBeltApplications = computed<PendingBeltApplication[]>(() => {
		const applications = pendingApplicationsData.value || [];
		const membersById = MembersById.value;
		const beltsById = BeltsById.value;
		const enriched = applications.map((application) => {
			const member = membersById[application.memberId] || null;
			const belt = beltsById[application.beltId] || null;
			const memberName = getMemberName(member);
			const beltSortOrder = belt?.sortOrder ?? Number.MAX_SAFE_INTEGER;
			return {
				application,
				member,
				belt,
				memberName,
				beltSortOrder,
			};
		});
		return enriched.sort((a, b) => {
			if (a.beltSortOrder !== b.beltSortOrder) {
				return a.beltSortOrder - b.beltSortOrder;
			}
			return a.memberName.localeCompare(b.memberName);
		});
	});

	/**
	 * Realtime invalidation for pending applications.
	 */
	const realtimeEvents = UseSupabaseRealtimeAllTables();
	const invalidatePendingApplications = (evt: { table: string }): void => {
		if (evt.table !== "member_belts") {
			return;
		}
		queryClient.invalidateQueries({ queryKey: ["memberBeltsPending"] });
	};
	const invalidateLatestBelts = (evt: { table: string }): void => {
		if (evt.table !== "member_belts") {
			return;
		}
		queryClient.invalidateQueries({ queryKey: ["memberBeltsLatest"] });
	};
	const invalidateMemberBeltsByMemberId = (evt: { table: string }): void => {
		if (evt.table !== "member_belts") {
			return;
		}
		queryClient.invalidateQueries({ queryKey: ["memberBeltsByMemberId"] });
	};
	realtimeEvents.events.on("INSERT", invalidatePendingApplications);
	realtimeEvents.events.on("UPDATE", invalidatePendingApplications);
	realtimeEvents.events.on("DELETE", invalidatePendingApplications);
	realtimeEvents.events.on("INSERT", invalidateLatestBelts);
	realtimeEvents.events.on("UPDATE", invalidateLatestBelts);
	realtimeEvents.events.on("DELETE", invalidateLatestBelts);
	realtimeEvents.events.on("INSERT", invalidateMemberBeltsByMemberId);
	realtimeEvents.events.on("UPDATE", invalidateMemberBeltsByMemberId);
	realtimeEvents.events.on("DELETE", invalidateMemberBeltsByMemberId);

	return {
		// ...store,
		// MemberBelts: store.Items,
		MembersLatestBeltsByMemberId,
		PendingBeltApplications,
		getMemberBeltsByMemberIdQuery,
		isPendingApplicationsLoading,
		isPendingApplicationsError,
		pendingApplicationsError,
	};
}
