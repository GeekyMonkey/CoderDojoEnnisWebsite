import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthChangeEvent } from "@supabase/supabase-js";

const mocks = { replace: vi.fn(), reload: vi.fn() };
let plugin: () => void;
let history: (event: PageTransitionEvent) => void;
let auth: (event: AuthChangeEvent) => void;
const location: {
	pathname: string;
	replace: typeof mocks.replace;
	reload: typeof mocks.reload;
} = { pathname: "/mentor/attendance", ...mocks };
beforeAll(async (): Promise<void> => {
	vi.stubGlobal(
		"defineNuxtPlugin",
		(callback: () => void): (() => void) => callback,
	);
	plugin = (await import("./kiosk-navigation.client"))
		.default as unknown as () => void;
});
beforeEach((): void => {
	vi.clearAllMocks();
	location.pathname = "/mentor/attendance";
	vi.stubGlobal("location", location);
	vi.stubGlobal(
		"addEventListener",
		(_name: string, callback: typeof history): void => {
			history = callback;
		},
	);
	vi.stubGlobal("useSupabaseClient", (): object => ({
		auth: {
			onAuthStateChange: (callback: typeof auth): void => {
				auth = callback;
			},
		},
	}));
	plugin();
});
describe("shared-device history and tabs", (): void => {
	it.each(["/mentor/attendance", "/member/calendar"])(
		"discards another protected tab on logout: %s",
		(path: string): void => {
			location.pathname = path;
			auth("SIGNED_OUT");
			expect(mocks.replace).toHaveBeenCalledWith("/login");
		},
	);
	it("leaves the mentor entry page to complete its kiosk transition", (): void => {
		location.pathname = "/mentor/SignIn";
		auth("SIGNED_OUT");
		expect(mocks.replace).not.toHaveBeenCalled();
	});
	it.each(["/mentor/attendance", "/member/calendar"])(
		"reloads a protected page restored from browser history: %s",
		(path: string): void => {
			location.pathname = path;
			history({ persisted: true } as PageTransitionEvent);
			expect(mocks.reload).toHaveBeenCalled();
		},
	);
	it("does not disrupt kiosk/public pages or normal token refresh", (): void => {
		location.pathname = "/kiosk/sign-in";
		auth("SIGNED_OUT");
		history({ persisted: true } as PageTransitionEvent);
		location.pathname = "/mentor/attendance";
		auth("TOKEN_REFRESHED");
		expect(mocks.replace).not.toHaveBeenCalled();
		expect(mocks.reload).not.toHaveBeenCalled();
	});
});
