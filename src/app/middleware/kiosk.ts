import { defineNuxtRouteMiddleware, navigateTo } from "nuxt/app";
import { useKioskStore } from "~/stores/useKioskStore";

/** Require the server-verified kiosk cookie and no retained portal identity. */
export default defineNuxtRouteMiddleware(async () => {
 const client: ReturnType<typeof useSupabaseClient> = useSupabaseClient();
 const { data } = await client.auth.getSession();
 if (data.session) return navigateTo("/mentor/SignIn");
 try { await useKioskStore().status(); }
 catch { return navigateTo("/login"); }
});
