import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { effectScope, nextTick, ref, type EffectScope, type Ref } from "vue";
import { QueryClient } from "@tanstack/vue-query";
import { useMemberCalendarStore } from "./useMemberCalendarStore";

const mocks = vi.hoisted(() => ({
	client: null as QueryClient | null,
	user: null as Ref<object | null> | null,
	profile: null as Ref<object | null> | null,
	fetch: vi.fn(),
	headers: vi.fn(),
}));
vi.mock("@tanstack/vue-query", async (original): Promise<unknown> => {
	const actual = await original<typeof import("@tanstack/vue-query")>();
	return {
		...actual,
		useQueryClient: (): QueryClient => mocks.client!,
		useQuery: (options: Parameters<typeof actual.useQuery>[0]): unknown =>
			actual.useQuery(options, mocks.client!),
		useMutation: (options: Parameters<typeof actual.useMutation>[0]): unknown =>
			actual.useMutation(options, mocks.client!),
	};
});
vi.mock("./useMyProfileStore", (): object => ({
	useMyProfileStore: (): object => ({ profile: mocks.profile }),
}));
vi.mock("~/composables/useProfileAuthorization", (): object => ({
	useProfileAuthorization: (): unknown => mocks.headers,
}));
vi.mock("~/composables/UseSupabaseRealtimeAllTables", (): object => ({
	UseSupabaseRealtimeAllTables: (): object => ({
		events: { on: vi.fn(), off: vi.fn() },
	}),
}));
let scope: EffectScope;
beforeEach((): void => {
	vi.resetAllMocks();
	mocks.client = new QueryClient({
		defaultOptions: { queries: { retry: false, gcTime: Infinity } },
	});
	mocks.user = ref(null);
	mocks.profile = ref(null);
	scope = effectScope();
	vi.stubGlobal("useSupabaseUser", (): unknown => mocks.user);
	vi.stubGlobal("$fetch", mocks.fetch);
	mocks.headers.mockResolvedValue({ Authorization: "Bearer test" });
	mocks.fetch.mockImplementation(async (path: string): Promise<object> => ({
		sessions:
			path === "/api/member/calendar"
				? [
						{
							id: "00000000-0000-4000-8000-000000000001",
							topic: "Private planning",
							sessionDate: "2030-10-14",
							description: "",
							sessionType: "MENTOR_PLANNING",
						},
					]
				: [],
		pods: [],
		isMentor: path === "/api/member/calendar",
		today: "2026-10-14",
	}));
});
afterEach((): void => {
	scope.stop();
	mocks.client!.clear();
	vi.unstubAllGlobals();
});
describe("reusable Calendar TanStack store", (): void => {
	it("fetches while logged out without authorization and shares the public query", async (): Promise<void> => {
		const view: Ref<"future" | "past"> = ref("future");
		const store: ReturnType<typeof useMemberCalendarStore> = scope.run(() =>
			useMemberCalendarStore(view, null, "public"),
		)!;
		scope.run(() => useMemberCalendarStore(view, null, "public"));
		await vi.waitFor(() => expect(store.data.value).not.toBeNull());
		expect(mocks.fetch).toHaveBeenCalledTimes(1);
		expect(mocks.fetch).toHaveBeenCalledWith(
			"/api/calendar",
			expect.objectContaining({
				headers: undefined,
				query: { view: "future" },
			}),
		);
		expect(mocks.headers).not.toHaveBeenCalled();
		view.value = "past";
		await vi.waitFor(() =>
			expect(mocks.fetch).toHaveBeenLastCalledWith(
				"/api/calendar",
				expect.objectContaining({ query: { view: "past" } }),
			),
		);
	});
	it("isolates authenticated planning from the public cache and strips it immediately on logout", async (): Promise<void> => {
		mocks.user!.value = { email: "mentor@example.invalid" };
		mocks.profile!.value = { isMentor: true, isParent: false, isNinja: false };
		const store: ReturnType<typeof useMemberCalendarStore> = scope.run(() =>
			useMemberCalendarStore(),
		)!;
		await vi.waitFor(() => expect(store.isMentor.value).toBe(true));
		expect(store.data.value?.sessions).toHaveLength(1);
		mocks.user!.value = null;
		await nextTick();
		expect(store.isMentor.value).toBe(false);
		expect(
			store.data.value?.sessions.some(
				(row): boolean => row.sessionType === "MENTOR_PLANNING",
			) ?? false,
		).toBe(false);
		await vi.waitFor(() =>
			expect(mocks.fetch).toHaveBeenLastCalledWith(
				"/api/calendar",
				expect.objectContaining({ headers: undefined }),
			),
		);
	});
});
