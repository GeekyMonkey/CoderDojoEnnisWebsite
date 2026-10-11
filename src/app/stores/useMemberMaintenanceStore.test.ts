import { describe, expect, it, vi } from "vitest";
import { effectScope, ref, type EffectScope } from "vue";
import { useMemberMaintenanceStore } from "./useMemberMaintenanceStore";

type Mocks = { invalidate: ReturnType<typeof vi.fn>; on: ReturnType<typeof vi.fn>; off: ReturnType<typeof vi.fn> };
const mocks: Mocks = vi.hoisted((): Mocks => ({ invalidate: vi.fn(), on: vi.fn(), off: vi.fn() }));
vi.mock("@tanstack/vue-query", (): object => ({
	useQueryClient: (): object => ({ invalidateQueries: mocks.invalidate }),
	useQuery: (): object => ({ data: ref(null), isPending: ref(false), isError: ref(false) }),
	useMutation: (): object => ({ mutateAsync: vi.fn(), isPending: ref(false) }),
}));
vi.mock("~/composables/UseSupabaseRealtimeAllTables", (): object => ({ UseSupabaseRealtimeAllTables: (): object => ({ events: { on: mocks.on, off: mocks.off } }) }));

describe("maintenance realtime lifecycle", (): void => {
	it("refreshes relationship views and disposes all listeners", (): void => {
		vi.stubGlobal("useSupabaseUser", (): object => ref({ email: "example@coderdojoennis.com" }));
		vi.stubGlobal("useSupabaseClient", (): object => ({ auth: { getSession: vi.fn() } }));
		const scope: EffectScope = effectScope();
		try {
			scope.run((): ReturnType<typeof useMemberMaintenanceStore> => useMemberMaintenanceStore());
			const handler: ((event: { table: string }) => void) | null = mocks.on.mock.calls.find((call: unknown[]): boolean => call[0] === "UPDATE")?.[1] ?? null;
			if (!handler) throw new Error("Missing listener");
			handler({ table: "unrelated" }); expect(mocks.invalidate).not.toHaveBeenCalled();
			handler({ table: "member_parents" }); expect(mocks.invalidate).toHaveBeenCalledWith({ queryKey: ["memberMaintenance"] });
			expect(mocks.invalidate).toHaveBeenCalledWith({ queryKey: ["profiles"] });
		} finally { scope.stop(); vi.unstubAllGlobals(); }
		expect(mocks.off).toHaveBeenCalledTimes(3);
	});
});
