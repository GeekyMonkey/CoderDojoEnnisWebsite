import { useAuthStore } from "../stores/useAuthStore";

export default defineNuxtPlugin(async () => {
	const { supabaseClient } = UseSupabaseClient();
	const store = useAuthStore();
	// Initial session load
	try {
		const { data } = await supabaseClient.auth.getSession();
		if (data.session?.user) {
			store.setUser(data.session.user);
		} else {
			store.setUser(null);
		}
	} catch (e: any) {
		store.setError(e?.message || "Failed to load session");
	} finally {
		store.markReady();
	}

	// Subscribe to auth events
	supabaseClient.auth.onAuthStateChange((_event, session) => {
		store.setUser(session?.user || null);
	});
});
