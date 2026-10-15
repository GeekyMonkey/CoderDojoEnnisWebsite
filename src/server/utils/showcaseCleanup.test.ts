import { describe, expect, it, vi } from "vitest";
import type { SupabaseClientType } from "#server/db/DatabaseClient";
import { cleanupShowcaseImages } from "./showcaseCleanup";
describe("showcase storage cleanup", (): void => {
	it("removes queued paths and acknowledges only after storage succeeds", async (): Promise<void> => {
		const rpc = vi
			.fn()
			.mockResolvedValueOnce({
				data: [{ path: "member/item/image.png" }],
				error: null,
			})
			.mockResolvedValueOnce({ error: null });
		const remove = vi.fn().mockResolvedValue({ error: null });
		const client: SupabaseClientType = {
			schema: () => ({ rpc }),
			storage: { from: () => ({ remove }) },
		} as unknown as SupabaseClientType;
		await cleanupShowcaseImages(client);
		expect(remove).toHaveBeenCalledWith(["member/item/image.png"]);
		expect(rpc).toHaveBeenLastCalledWith("ack_showcase_cleanup", {
			p_paths: ["member/item/image.png"],
		});
	});
	it("leaves failed removals queued for retry", async (): Promise<void> => {
		const rpc = vi.fn().mockResolvedValue({
			data: [{ path: "member/item/image.png" }],
			error: null,
		});
		const client: SupabaseClientType = {
			schema: () => ({ rpc }),
			storage: {
				from: () => ({
					remove: vi
						.fn()
						.mockResolvedValue({ error: { message: "unavailable" } }),
				}),
			},
		} as unknown as SupabaseClientType;
		const warn = vi.spyOn(console, "warn").mockImplementation((): void => {});
		await cleanupShowcaseImages(client);
		expect(rpc).toHaveBeenCalledTimes(1);
		warn.mockRestore();
	});
});
