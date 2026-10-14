import { MutationCache, QueryCache, QueryClient, VueQueryPlugin } from "@tanstack/vue-query";
import { useAuthStore } from "~/stores/useAuthStore";
import { createSessionRecovery, isSessionRejected } from "~/utils/sessionRecovery";

/** Recover rejected sessions centrally for all store queries and mutations. */
export default defineNuxtPlugin((nuxtApp): void => {
	const client: ReturnType<typeof useSupabaseClient> = useSupabaseClient();
	const user: ReturnType<typeof useSupabaseUser> = useSupabaseUser();
	const router: ReturnType<typeof useRouter> = useRouter();
	const recover: (error: unknown) => Promise<void> = createSessionRecovery({
		isProtectedPage: (): boolean => /^\/(mentor|coder|parent|member)(\/|$)/.test(router.currentRoute.value.path),
		signOut: async (): Promise<void> => { await client.auth.signOut({ scope: "local" }); },
		clear: (): void => { user.value = null; useAuthStore().reset(); queryClient.clear(); },
		redirect: async (): Promise<void> => { await router.replace({ path: "/login", query: { reason: "session-expired" } }); },
	});
	/** Handle authentication failures without leaving an unhandled callback rejection. */
	function onError(error: unknown): void {
		void recover(error).catch((): void => { console.error("Unable to complete session recovery"); });
	}
	const queryClient: QueryClient = new QueryClient({
		queryCache: new QueryCache({ onError }),
		mutationCache: new MutationCache({ onError }),
		defaultOptions: { queries: { retry: (failureCount: number, error: Error): boolean => !isSessionRejected(error) && failureCount < 3 } },
	});
	nuxtApp.vueApp.use(VueQueryPlugin, { queryClient });
});
