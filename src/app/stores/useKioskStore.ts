import { useQueryClient } from "@tanstack/vue-query";
import { useAuthStore } from "./useAuthStore";
import { useProfileAuthorization } from "~/composables/useProfileAuthorization";
import type { KioskStatus, KioskSignInRequest, KioskSignInResponse } from "#shared/types/Kiosk";
import type { ApiResponse } from "#shared/types/ApiResponse";

type KioskStore = {
 start: () => Promise<void>;
 status: () => Promise<KioskStatus>;
 end: () => Promise<void>;
 signInMember: (args: { username: string; password: string }) => Promise<ApiResponse<KioskSignInResponse>>;
 signInMemberByGuid: (args: { memberGuid: string }) => Promise<ApiResponse<KioskSignInResponse>>;
 signInMemberByNfcTag: (args: { nfcTag: string }) => Promise<ApiResponse<KioskSignInResponse>>;
};

/** Own kiosk API calls and the transition that removes portal authority. */
export function useKioskStore(): KioskStore {
 const client: ReturnType<typeof useSupabaseClient> = useSupabaseClient();
 const user: ReturnType<typeof useSupabaseUser> = useSupabaseUser();
 const auth: ReturnType<typeof useAuthStore> = useAuthStore();
 const queries: ReturnType<typeof useQueryClient> = useQueryClient();
 const authorization: ReturnType<typeof useProfileAuthorization> = useProfileAuthorization();

 /** Revoke server authority, clear local credentials and discard private data before navigation. */
 async function start(): Promise<void> {
  try { await $fetch<KioskStatus>("/api/Kiosk/Start", { method: "POST", headers: await authorization(), credentials: "same-origin" }); }
  finally {
   try {
    const { error } = await client.auth.signOut({ scope: "local" });
    if (error) throw error;
   } finally {
    user.value = null; auth.reset();
    try { await queries.cancelQueries(); }
    finally { queries.clear(); await client.removeAllChannels(); }
   }
  }
 }
 /** Check expiry using the server-held cookie rather than client storage. */
 async function status(): Promise<KioskStatus> { return $fetch<KioskStatus>("/api/Kiosk/Status", { credentials: "same-origin" }); }
 /** End kiosk access and require authentication for any later management action. */
 async function end(): Promise<void> { await $fetch("/api/Kiosk/End", { method: "POST", credentials: "same-origin" }); }
 /** Send a supported attendance action through the cookie-scoped endpoint. */
 async function signIn(body: KioskSignInRequest): Promise<ApiResponse<KioskSignInResponse>> {
  return $fetch<ApiResponse<KioskSignInResponse>>("/api/Kiosk/SignIn", { method: "POST", credentials: "same-origin", body });
 }
 return { start, status, end, signInMember: (args): Promise<ApiResponse<KioskSignInResponse>> => signIn({ kind: "password", ...args }), signInMemberByGuid: (args): Promise<ApiResponse<KioskSignInResponse>> => signIn({ kind: "guid", ...args }), signInMemberByNfcTag: (args): Promise<ApiResponse<KioskSignInResponse>> => signIn({ kind: "nfc", ...args }) };
}
