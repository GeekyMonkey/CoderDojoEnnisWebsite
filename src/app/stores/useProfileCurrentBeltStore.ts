import { useQuery, type QueryFunctionContext } from "@tanstack/vue-query";
import { computed, toValue, type ComputedRef, type MaybeRefOrGetter } from "vue";
import { AchievementReviewSchema, type AchievementReview } from "#shared/types/AchievementReview";
import type { ApiResponse } from "#shared/types/ApiResponse";
import type { BeltModel } from "#shared/types/models/BeltModel";
import type { MemberIdentity } from "#shared/types/MemberIdentity";
import { useAuthStore } from "./useAuthStore";
import { useProfileAuthorization } from "~/composables/useProfileAuthorization";
import { UseSupabaseRealtimeTable } from "~/composables/UseSupabaseRealtimeTable";

/** Read a profile's current belt through authorized own or mentor history APIs. */
export function useProfileCurrentBeltStore(memberId: MaybeRefOrGetter<string>) {
 const auth: ReturnType<typeof useAuthStore> = useAuthStore();
 const headers: ReturnType<typeof useProfileAuthorization> = useProfileAuthorization();
 const user: ReturnType<typeof useSupabaseUser> = useSupabaseUser();
 const id: ComputedRef<string> = computed((): string => toValue(memberId));
 const query: ReturnType<typeof useQuery<BeltModel | null>> = useQuery<BeltModel | null>({
  queryKey: computed((): readonly unknown[] => ["profileCurrentBelt", user.value?.id ?? "", id.value]),
  enabled: computed((): boolean => Boolean(user.value && id.value)),
  queryFn: async ({ signal }: QueryFunctionContext): Promise<BeltModel | null> => {
   const target: string = id.value;
   const actor: MemberIdentity = await auth.getIdentity();
   if (!actor.isMentor && (!actor.isNinja || actor.id !== target)) throw new Error("Profile access required");
   const response: ApiResponse<AchievementReview[]> = await $fetch(actor.isMentor ? "/api/Achievements/History" : "/api/Coder/achievements/belt", {
    headers: await headers(), signal, query: actor.isMentor ? { kind: "belt", memberId: target } : {},
   });
   if (!response.success) throw new Error(response.error);
   const rows: AchievementReview[] = AchievementReviewSchema.array().parse(response.data);
   return rows.filter((row: AchievementReview): boolean => row.memberId === target && row.awarded !== null)
    .sort((a: AchievementReview, b: AchievementReview): number => (b.awarded ?? 0) - (a.awarded ?? 0))[0]?.belt ?? null;
  },
  staleTime: 30_000,
  retry: false,
 });
 UseSupabaseRealtimeTable({ table: "member_belts", onInvalidate: (): void => { void query.refetch(); } });
 UseSupabaseRealtimeTable({ table: "belts", onInvalidate: (): void => { void query.refetch(); } });
 return query;
}
