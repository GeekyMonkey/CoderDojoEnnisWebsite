import { describe, expect, it, vi } from "vitest";
import { effectScope, ref, type EffectScope } from "vue";
import { useMyProfileStore } from "./useMyProfileStore";

type Mocks = { refreshImages: ReturnType<typeof vi.fn>; invalidate: ReturnType<typeof vi.fn>; on: ReturnType<typeof vi.fn>; off: ReturnType<typeof vi.fn>; fetch: ReturnType<typeof vi.fn> };
const mocks: Mocks = vi.hoisted((): Mocks => ({ refreshImages: vi.fn(), invalidate: vi.fn(), on: vi.fn(), off: vi.fn(), fetch: vi.fn() }));
vi.mock("~/composables/useProfileImageRevision", (): object => ({
    useProfileImageRevision: (): object => ({ revision: ref("test"), refresh: mocks.refreshImages }),
}));
vi.mock("@tanstack/vue-query", (): object => ({
	useQueryClient: (): object => ({ invalidateQueries: mocks.invalidate, setQueryData: vi.fn() }),
	useQuery: (): object => ({ data: ref(null), isPending: ref(false), isError: ref(false) }),
	useMutation: (): object => ({ mutateAsync: vi.fn(), isPending: ref(false) }),
}));
vi.mock("~/composables/UseSupabaseRealtimeAllTables", (): object => ({
	UseSupabaseRealtimeAllTables: (): object => ({ events: { on: mocks.on, off: mocks.off } }),
}));

describe("mentor profile realtime", (): void => {
	it("invalidates profile and member caches only for member changes and disposes listeners", async (): Promise<void> => {
		vi.stubGlobal("useSupabaseUser", (): object => ref({ email: "example@coderdojoennis.com" }));
		vi.stubGlobal("useSupabaseClient", (): object => ({ auth: { getSession: vi.fn() } }));
		const scope: EffectScope = effectScope();
		try {
			scope.run((): ReturnType<typeof useMyProfileStore> => useMyProfileStore());
			const handler: ((event: { table: string }) => void) | null = mocks.on.mock.calls.find((call: unknown[]): boolean => call[0] === "UPDATE")?.[1] ?? null;
			if (!handler) throw new Error("Realtime listener missing");
			handler({ table: "teams" });
			expect(mocks.invalidate).not.toHaveBeenCalled();
			handler({ table: "members" });
			expect(mocks.refreshImages).toHaveBeenCalledTimes(1);
			expect(mocks.invalidate).toHaveBeenCalledWith({ queryKey: ["profiles"] });
			expect(mocks.invalidate).toHaveBeenCalledWith({ queryKey: ["members"] });
		} finally {
			scope.stop();
			vi.unstubAllGlobals();
		}
		expect(mocks.off).toHaveBeenCalledTimes(3);
	});
});
