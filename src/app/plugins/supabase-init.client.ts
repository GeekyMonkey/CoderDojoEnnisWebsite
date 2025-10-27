// Ensures Supabase session is loaded into the user ref early on a hard reload.
// The @nuxtjs/supabase module already persists the session in localStorage.
// We proactively call getSession() so middleware executed shortly after has user data.
export default defineNuxtPlugin(async () => {
	const log = useLogger("supabase-init");

	try {
		const user = useSupabaseUser();
		if (!user.value) {
			const client = useSupabaseClient();
			const { data } = await client.auth.getSession();
			if (data.session?.user) {
				// The composable will auto-populate reactive user, nothing else needed.
				log.info("Session restored for", {
					id: data.session.user.id,
					email: data.session.user.email,
				});
			}
		}
	} catch (err) {
		log.error("Unable to pre-load session", undefined, err);
	}
});
