import { defineNuxtPlugin } from "nuxt/app";
import { createTRPCNuxtClient, httpBatchLink } from "trpc-nuxt/client";
import type { AppRouter } from "~~/shared/trpc/routers";

export default defineNuxtPlugin(() => {
	/**
	 * createTRPCNuxtClient adds a `useQuery` composable
	 * built on top of `useAsyncData`.
	 */
	const trpcClient = createTRPCNuxtClient<AppRouter>({
		links: [
			httpBatchLink({
				url: "/api/trpc",
			}),
		],
	});

	return {
		provide: {
			trpc: trpcClient,
		},
	};
});

export type TrpcType = ReturnType<typeof createTRPCNuxtClient<AppRouter>>;
