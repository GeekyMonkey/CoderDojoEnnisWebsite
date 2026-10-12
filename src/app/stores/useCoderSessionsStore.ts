import { useMutation, useQueryClient } from "@tanstack/vue-query";
import type { Ref } from "vue";
import { coderSessionsSchema, coderSessionJoinSchema, coderSessionJoinedSchema, type CoderSession, type CoderSessionJoined } from "#shared/types/CoderSession";
import { useProfileAuthorization } from "~/composables/useProfileAuthorization";
import { useCoderQuery, type CoderQuery } from "./useCoderQuery";

type CoderSessionsStore = CoderQuery<CoderSession[]> & { isJoining: Ref<boolean>; join: (sessionId: string) => Promise<CoderSessionJoined> };

/** Own upcoming session caching, expiry refresh and validated attendance-producing joins. */
export function useCoderSessionsStore(): CoderSessionsStore {
 const query: CoderQuery<CoderSession[]> = useCoderQuery("sessions", coderSessionsSchema, 30_000);
 const headers: ReturnType<typeof useProfileAuthorization> = useProfileAuthorization();
 const cache: ReturnType<typeof useQueryClient> = useQueryClient();
 const mutation: ReturnType<typeof useMutation<CoderSessionJoined, Error, string>> = useMutation<CoderSessionJoined, Error, string>({
  mutationFn: async (sessionId: string): Promise<CoderSessionJoined> => coderSessionJoinedSchema.parse(await $fetch("/api/Coder/sessions/join", { method: "POST", body: coderSessionJoinSchema.parse({ sessionId }), headers: await headers() })),
  onSettled: async (): Promise<void> => { await Promise.all(["coder", "memberAttendanceHistory", "memberAttendances", "memberMaintenance"].map((key: string): Promise<void> => cache.invalidateQueries({ queryKey: [key] }))); },
 });
 /** Record authenticated own attendance and return the server-validated external URL. */
 async function join(sessionId: string): Promise<CoderSessionJoined> { return mutation.mutateAsync(coderSessionJoinSchema.parse({ sessionId }).sessionId); }
 return { ...query, isJoining: mutation.isPending, join };
}
