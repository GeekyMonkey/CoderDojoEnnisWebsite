import { afterEach, it, expect, vi } from "vitest";
import { useShowcaseRealtime } from "./useShowcaseRealtime";
const mocks = vi.hoisted(() => ({ cancel: vi.fn(), invalidate: vi.fn() }));
vi.mock("@tanstack/vue-query", () => ({
	useQueryClient: (): object => ({
		cancelQueries: mocks.cancel,
		invalidateQueries: mocks.invalidate,
	}),
}));
afterEach((): void => {
	vi.unstubAllGlobals();
	vi.clearAllMocks();
});
it("shares one row-free channel and refreshes showcase and evidence on changes and reconnect", async (): Promise<void> => {
	let notify: (() => void) | undefined;
	let subscribe: ((status: string) => void) | undefined;
	let dispose: (() => void) | undefined;
	const channel: object = {
		on: vi.fn(
			(_event: string, _filter: unknown, callback: () => void): object => {
				notify = callback;
				return channel;
			},
		),
		subscribe: vi.fn((callback: (status: string) => void): object => {
			subscribe = callback;
			return channel;
		}),
	};
	const client: {
		channel: ReturnType<typeof vi.fn>;
		removeChannel: ReturnType<typeof vi.fn>;
	} = { channel: vi.fn(() => channel), removeChannel: vi.fn() };
	const app: object = {
		vueApp: {
			onUnmount: (callback: () => void): void => {
				dispose = callback;
			},
		},
	};
	vi.stubGlobal("useSupabaseClient", () => client);
	vi.stubGlobal("useNuxtApp", () => app);
	useShowcaseRealtime();
	useShowcaseRealtime();
	expect(client.channel).toHaveBeenCalledTimes(1);
	notify?.();
	await vi.waitFor(() => {
		expect(mocks.invalidate).toHaveBeenCalledWith({
			queryKey: ["achievementReviews"],
		});
		expect(mocks.invalidate).toHaveBeenCalledWith({ queryKey: ["showcase"] });
	});
	expect(mocks.cancel).toHaveBeenCalledWith({
		queryKey: ["achievementReviews"],
	});
	mocks.invalidate.mockClear();
	subscribe?.("SUBSCRIBED");
	await vi.waitFor(() => expect(mocks.invalidate).toHaveBeenCalledTimes(2));
	dispose?.();
	expect(client.removeChannel).toHaveBeenCalledWith(channel);
});
