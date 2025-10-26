// Ensures Supabase session is loaded into the user ref early on a hard reload.
// The @nuxtjs/supabase module already persists the session in localStorage.
// We proactively call getSession() so middleware executed shortly after has user data.
export default defineNuxtPlugin(async () => {
	try {
		const user = useSupabaseUser();
		if (!user.value) {
			const client = useSupabaseClient();
			const { data } = await client.auth.getSession();
			if (data.session?.user) {
				// The composable will auto-populate reactive user, nothing else needed.
				console.log(
					"[supabase-init] Session restored for",
					data.session.user.id,
				);
			}
		}
	} catch (err) {
		console.warn("[supabase-init] Unable to pre-load session", err);
	}
});
