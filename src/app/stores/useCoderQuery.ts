import { useQuery, useQueryClient, type QueryFunctionContext } from "@tanstack/vue-query";
import { computed, onScopeDispose, toValue, type ComputedRef, type MaybeRefOrGetter, type Ref } from "vue";
import type { z } from "zod";
import { useProfileAuthorization } from "~/composables/useProfileAuthorization";
import { UseSupabaseRealtimeAllTables } from "~/composables/UseSupabaseRealtimeAllTables";
export type CoderQuery<T> = {data:ComputedRef<T|null>;isPending:Ref<boolean>;isError:Ref<boolean>;refresh:()=>Promise<void>};
/** Cache validated coder data and refresh related pages after remote changes. */
export function useCoderQuery<T>(path:MaybeRefOrGetter<string|null>,schema:z.ZodType<T>):CoderQuery<T> {
 const user:ReturnType<typeof useSupabaseUser> = useSupabaseUser();
 const headers:ReturnType<typeof useProfileAuthorization> = useProfileAuthorization();
 const cache:ReturnType<typeof useQueryClient> = useQueryClient();
 const query:ReturnType<typeof useQuery<T>> = useQuery<T>({queryKey:computed(():readonly unknown[]=>["coder",user.value?.email??"",toValue(path)]),enabled:computed(():boolean=>Boolean(user.value)&&toValue(path)!==null),retry:false,queryFn:async({signal}:QueryFunctionContext):Promise<T>=>schema.parse(await $fetch(`/api/Coder/${toValue(path)}`,{headers:await headers(),signal}))});
 /** Invalidate coder queries after local writes or relevant realtime events. */
 async function refresh():Promise<void> { await cache.invalidateQueries({queryKey:["coder"]}); }
 const realtime:ReturnType<typeof UseSupabaseRealtimeAllTables> = UseSupabaseRealtimeAllTables();
 /** Refresh when membership, team, achievement or session records change. */
 function invalidate(event:{table:string}):void { if (["members","teams","belts","badges","badge_categories","member_belts","member_badges","member_attendances","sessions"].includes(event.table)) void refresh(); }
 realtime.events.on("INSERT",invalidate);realtime.events.on("UPDATE",invalidate);realtime.events.on("DELETE",invalidate);
 onScopeDispose(():void=>{realtime.events.off("INSERT",invalidate);realtime.events.off("UPDATE",invalidate);realtime.events.off("DELETE",invalidate);});
 return {data:computed(():T|null=>query.data.value??null),isPending:query.isPending,isError:query.isError,refresh};
}
