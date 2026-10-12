import { describe, expect, it, vi } from "vitest";
import { createSessionRecovery, isSessionRejected } from "./sessionRecovery";

describe("session recovery", (): void => {
	it("recognizes authentication rejection without logging out on access denial or outages", (): void => {
		expect(isSessionRejected({ statusCode: 401 })).toBe(true);
		expect(isSessionRejected({ status: 401 })).toBe(true);
		for (const failure of [null, new Error("Network error"), { statusCode: 403 }, { statusCode: 503 }]) {
			expect(isSessionRejected(failure)).toBe(false);
		}
	});
	it("signs out and redirects once for concurrent failures, clearing cached member data first", async (): Promise<void> => {
		const order: string[] = [];
		let finishSignOut: () => void = (): void => {};
		const signOut: ReturnType<typeof vi.fn> = vi.fn((): Promise<void> => new Promise<void>((resolve): void => { finishSignOut = resolve; order.push("signOut"); }));
		const recover: (error: unknown) => Promise<void> = createSessionRecovery({
			isProtectedPage: (): boolean => true,
			signOut,
			clear: (): void => { order.push("clear"); },
			redirect: async (): Promise<void> => { order.push("redirect"); },
		});
		const first: Promise<void> = recover({ statusCode: 401 });
		const second: Promise<void> = recover({ statusCode: 401 });
		expect(order).toEqual(["signOut"]);
		finishSignOut();
		await Promise.all([first, second]);
		expect(signOut).toHaveBeenCalledTimes(1);
		expect(order).toEqual(["signOut", "clear", "redirect"]);
	});
	it("ignores failed login requests and non-authentication failures", async (): Promise<void> => {
		const signOut: ReturnType<typeof vi.fn> = vi.fn();
		const recover: (error: unknown) => Promise<void> = createSessionRecovery({ isProtectedPage: (): boolean => false, signOut, clear: vi.fn(), redirect: vi.fn() });
		await recover({ statusCode: 401 });
		expect(signOut).not.toHaveBeenCalled();
	});
	it("still clears and redirects if the sign-out request fails", async (): Promise<void> => {
		const clear: ReturnType<typeof vi.fn> = vi.fn();
		const redirect: ReturnType<typeof vi.fn> = vi.fn();
		const recover: (error: unknown) => Promise<void> = createSessionRecovery({ isProtectedPage: (): boolean => true, signOut: async (): Promise<void> => { throw new Error("Offline"); }, clear, redirect });
		await expect(recover({ statusCode: 401 })).rejects.toThrow("Offline");
		expect(clear).toHaveBeenCalledOnce();
		expect(redirect).toHaveBeenCalledOnce();
	});
});
