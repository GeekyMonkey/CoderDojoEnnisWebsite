import type { AuthChangeEvent } from "@supabase/supabase-js";

/** Discard protected browser-history and other-tab views after portal logout. */
export default defineNuxtPlugin((): void => {
	const client: ReturnType<typeof useSupabaseClient> = useSupabaseClient();
	globalThis.addEventListener(
		"pageshow",
		(event: PageTransitionEvent): void => {
			if (
				event.persisted &&
				/^\/(mentor|coder|parent|member)(\/|$)/.test(
					globalThis.location.pathname,
				)
			)
				globalThis.location.reload();
		},
	);
	client.auth.onAuthStateChange((event: AuthChangeEvent): void => {
		const path: string = globalThis.location.pathname
			.toLowerCase()
			.replace(/\/+$/, "");
		// The entry page owns the logout-to-kiosk transition; other protected tabs must discard their views.
		if (
			event === "SIGNED_OUT" &&
			path !== "/mentor/signin" &&
			/^\/(mentor|coder|parent|member)(\/|$)/.test(path)
		)
			globalThis.location.replace("/login");
	});
});
