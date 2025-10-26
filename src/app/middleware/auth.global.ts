import { defineNuxtRouteMiddleware, navigateTo } from "nuxt/app";
import { useAuthStore } from "../stores/useAuthStore";

// NOTE: On a hard reload the Supabase user ref may not yet be populated when this
// middleware first executes. We make it async and try to restore the existing
// session (from localStorage) before deciding to redirect.
export default defineNuxtRouteMiddleware(async (to, from) => {
	let redirectToLogin = false;
	const section = to?.path.split("/")[1];
	const authStore = useAuthStore();

	// Wait for auth store initialization (client side) before deciding
	if (process.client && authStore.initializing.value) {
		// Small loop waiting for initialization (max ~500ms) to prevent race
		const started = performance.now();
		while (authStore.initializing.value && performance.now() - started < 500) {
			await new Promise((r) => setTimeout(r, 25));
		}
	}

	// Debug logging (temporary) to diagnose refresh redirect issue
	if (process.client) {
		const user = useSupabaseUser();
		console.debug("[AuthMiddleware] Route check", {
			path: to.fullPath,
			section,
			initialUserAud: user.value?.aud,
		});
	}

	// Only run auth check for protected top-level sections
	switch (section) {
		case "mentor":
		case "coder":
		case "parent": {
			// Prefer store if ready, fallback to direct check
			const authenticated = authStore.ready.value
				? authStore.isAuthenticated.value
				: await isAuthenticated();
			redirectToLogin = !authenticated;
			break;
		}
	}

	if (redirectToLogin) {
		return navigateTo("/login");
	}
});

async function isAuthenticated(): Promise<boolean> {
	const user = useSupabaseUser();
	if (user.value?.aud === "authenticated") {
		return true;
	}

	// Attempt to restore session (race condition on first load)
	try {
		const client = useSupabaseClient();
		const { data } = await client.auth.getSession();
		const restored = !!data.session?.user;
		if (process.client) {
			console.debug("[AuthMiddleware] getSession() result", {
				restored,
				userId: data.session?.user?.id,
			});
		}
		return restored;
	} catch (err) {
		console.warn("[Auth_middleware] Failed to restore Supabase session", err);
		return false;
	}
}
