import { useShowcaseRealtime } from "~/composables/useShowcaseRealtime";
import {
	useQuery,
	useQueryClient,
	type QueryFunctionContext,
} from "@tanstack/vue-query";
import {
	computed,
	onScopeDispose,
	toValue,
	type ComputedRef,
	type MaybeRefOrGetter,
} from "vue";
import {
	AchievementDecisionSchema,
	AchievementReviewSchema,
	type AchievementDecision,
	type AchievementKind,
	type AchievementReview,
} from "#shared/types/AchievementReview";
import type { ApiResponse } from "#shared/types/ApiResponse";
import { UseSupabaseRealtimeAllTables } from "~/composables/UseSupabaseRealtimeAllTables";

/** Own authenticated achievement queries, decisions and realtime invalidation. */
export function useAchievementReviewsStore(
	kind: AchievementKind,
	memberId?: MaybeRefOrGetter<string>,
	own: boolean = false,
	parent: boolean = false,
) {
	useShowcaseRealtime();
	const user: ReturnType<typeof useSupabaseUser> = useSupabaseUser();
	const client: ReturnType<typeof useSupabaseClient> = useSupabaseClient();
	const queryClient: ReturnType<typeof useQueryClient> = useQueryClient();
	const id: ComputedRef<string> = computed((): string =>
		memberId ? toValue(memberId) : "",
	);
	const key: ComputedRef<readonly unknown[]> = computed(
		(): readonly unknown[] => [
			"achievementReviews",
			user.value?.email ?? "",
			kind,
			parent ? "parent" : own ? "own" : memberId ? "history" : "pending",
			id.value,
		],
	);

	/** Attach the current session without exposing tokens in query keys or logs. */
	async function headers(): Promise<{ Authorization: string }> {
		const { data, error } = await client.auth.getSession();
		if (error || !data.session) throw new Error("Authentication required");
		return { Authorization: `Bearer ${data.session.access_token}` };
	}

	const query: ReturnType<typeof useQuery<AchievementReview[]>> = useQuery<
		AchievementReview[]
	>({
		queryKey: key,
		enabled: computed(
			(): boolean =>
				Boolean(user.value) && (own || !memberId || Boolean(id.value)),
		),
		queryFn: async ({
			signal,
		}: QueryFunctionContext): Promise<AchievementReview[]> => {
			const response: ApiResponse<AchievementReview[]> = await $fetch(
				parent
					? `/api/Parent/children/${id.value}/achievements/${kind}`
					: own
						? `/api/Coder/achievements/${kind}`
						: memberId
							? "/api/Achievements/History"
							: "/api/Achievements/Pending",
				{
					headers: await headers(),
					signal,
					query:
						own || parent
							? {}
							: memberId
								? { kind, memberId: id.value }
								: { kind },
				},
			);
			if (!response.success) throw new Error(response.error);
			return AchievementReviewSchema.array().parse(response.data);
		},
		staleTime: 30_000,
		retry: false,
	});

	/** Refresh pending lists, histories and current belt displays after any decision. */
	async function refresh(): Promise<void> {
		await Promise.all([
			queryClient.invalidateQueries({ queryKey: ["achievementReviews"] }),
			queryClient.invalidateQueries({ queryKey: ["memberBeltsPending"] }),
			queryClient.invalidateQueries({ queryKey: ["memberBeltsLatest"] }),
			queryClient.invalidateQueries({ queryKey: ["memberBeltsByMemberId"] }),
		]);
	}

	/** Submit a decision and refresh even after a conflict to recover stale UI state. */
	async function decide(
		review: AchievementReview,
		action: AchievementDecision["action"],
		notes: string,
	): Promise<void> {
		if (own || parent) throw new Error("Mentor access required");
		const body: AchievementDecision = AchievementDecisionSchema.parse({
			kind,
			id: review.id,
			action,
			notes,
			expectedAwarded: review.awarded,
			expectedRejected: review.rejectedDate,
		});
		try {
			const response: ApiResponse<null> = await $fetch(
				"/api/Achievements/Decision",
				{ method: "POST", headers: await headers(), body },
			);
			if (!response.success) throw new Error(response.error);
		} finally {
			await refresh();
		}
	}

	const realtime: ReturnType<typeof UseSupabaseRealtimeAllTables> =
		UseSupabaseRealtimeAllTables();
	/** Refresh this query when its achievement records change elsewhere. */
	function invalidate(event: { table: string }): void {
		if (
			[
				"members",
				"member_parents",
				"badges",
				"badge_categories",
				"belts",
				"member_badges",
				"member_belts",
			].includes(event.table)
		) {
			void refresh();
		}
	}
	realtime.events.on("INSERT", invalidate);
	realtime.events.on("UPDATE", invalidate);
	realtime.events.on("DELETE", invalidate);
	onScopeDispose((): void => {
		realtime.events.off("INSERT", invalidate);
		realtime.events.off("UPDATE", invalidate);
		realtime.events.off("DELETE", invalidate);
	});
	return { ...query, decide };
}
