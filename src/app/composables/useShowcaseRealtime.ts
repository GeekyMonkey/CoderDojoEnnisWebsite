import { useQueryClient } from "@tanstack/vue-query";
import type { RealtimeChannel } from "@supabase/supabase-js";
const realtimeApps: WeakSet<object> = new WeakSet();
/** Refresh showcase cards and application evidence from the same row-free public signal. */
export function useShowcaseRealtime(): void {
	const cache: ReturnType<typeof useQueryClient> = useQueryClient();
	const client: ReturnType<typeof useSupabaseClient> = useSupabaseClient();
	const app: ReturnType<typeof useNuxtApp> = useNuxtApp();
	if (!import.meta.client || realtimeApps.has(app)) return;
	realtimeApps.add(app);
	/** Cancel obsolete fetches before refreshing dependent projections. */
	async function invalidate(): Promise<void> {
		await Promise.all(
			["showcase", "achievementReviews"].map(
				async (key: string): Promise<void> => {
					await cache.cancelQueries({ queryKey: [key] });
					await cache.invalidateQueries({ queryKey: [key] });
				},
			),
		);
	}
	const channel: RealtimeChannel = client
		.channel("coderdojo:showcase", { config: { private: false } })
		.on("broadcast", { event: "invalidate" }, (): void => {
			void invalidate();
		})
		.subscribe((status: string): void => {
			if (status === "SUBSCRIBED") void invalidate();
		});
	app.vueApp.onUnmount((): void => {
		void client.removeChannel(channel);
		realtimeApps.delete(app);
	});
}
