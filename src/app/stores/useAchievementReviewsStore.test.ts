import { describe, expect, it, vi } from "vitest";
import { effectScope, ref, type EffectScope } from "vue";
import type { AchievementReview } from "#shared/types/AchievementReview";
import { useAchievementReviewsStore } from "./useAchievementReviewsStore";

const mocks = vi.hoisted(() => ({ invalidate: vi.fn(), fetch: vi.fn(), session: vi.fn(), on: vi.fn(), off: vi.fn() }));
vi.mock("@tanstack/vue-query", (): object => ({
	useQueryClient: (): object => ({ invalidateQueries: mocks.invalidate }),
	useQuery: (): object => ({ data: ref([]) }),
}));
vi.mock("~/composables/UseSupabaseRealtimeAllTables", (): object => ({
	UseSupabaseRealtimeAllTables: (): object => ({ events: { on: mocks.on, off: mocks.off } }),
}));

const REVIEW: AchievementReview = { id: "application", kind: "belt", memberId: "member", memberName: "Example Coder", categoryId: null, categoryName: null, label: "White", sortOrder: 1, belt: null, description: "", applicationDate: 1, applicationNotes: "Original evidence", awarded: null, awardedByAdultId: null, awardedNotes: null, rejectedDate: null, rejectedByAdultId: null, rejectedNotes: null };

describe("achievement store decisions", (): void => {
	it("invalidates pending, history and latest belt queries after success or conflict and disposes subscriptions", async (): Promise<void> => {
		vi.stubGlobal("useSupabaseClient", (): object => ({ auth: { getSession: mocks.session } }));
		vi.stubGlobal("$fetch", mocks.fetch);
		mocks.session.mockResolvedValue({ data: { session: { access_token: "test-token" } }, error: null });
		mocks.fetch.mockResolvedValue({ success: true, data: null });
		const scope: EffectScope = effectScope();
		const store: ReturnType<typeof useAchievementReviewsStore> | undefined = scope.run((): ReturnType<typeof useAchievementReviewsStore> => useAchievementReviewsStore("belt"));
		if (!store) throw new Error("Store scope unavailable");
		try {
			await store.decide(REVIEW, "approve", "Reviewed");
			expect(mocks.fetch).toHaveBeenCalledWith("/api/Achievements/Decision", expect.objectContaining({ headers: { Authorization: "Bearer test-token" }, body: expect.objectContaining({ id: REVIEW.id, expectedAwarded: null, expectedRejected: null }) }));
			expect(mocks.invalidate).toHaveBeenCalledWith({ queryKey: ["achievementReviews"] });
			expect(mocks.invalidate).toHaveBeenCalledWith({ queryKey: ["memberBeltsLatest"] });
			expect(mocks.invalidate).toHaveBeenCalledWith({ queryKey: ["memberBeltsPending"] });
			mocks.invalidate.mockClear();
			mocks.fetch.mockRejectedValue(new Error("Conflict"));
			await expect(store.decide(REVIEW, "approve", "Reviewed")).rejects.toThrow("Conflict");
			expect(mocks.invalidate).toHaveBeenCalledWith({ queryKey: ["achievementReviews"] });
		} finally {
			scope.stop();
			vi.unstubAllGlobals();
		}
		expect(mocks.off).toHaveBeenCalledTimes(3);
	});
});
