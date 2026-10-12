import { useQuery, useQueryClient, type QueryFunctionContext } from "@tanstack/vue-query";
import { computed, onScopeDispose, toValue, type ComputedRef, type MaybeRefOrGetter, type Ref } from "vue";
import type { z } from "zod";
import { useProfileAuthorization } from "~/composables/useProfileAuthorization";
import { UseSupabaseRealtimeAllTables } from "~/composables/UseSupabaseRealtimeAllTables";
export type MemberQuery<T> = {data:ComputedRef<T|null>;isPending:Ref<boolean>;isError:Ref<boolean>;refresh:()=>Promise<void>};
/** Cache validated member data and refresh related pages after remote changes. */
export function useMemberQuery<T>(path:MaybeRefOrGetter<string|null>,schema:z.ZodType<T>,refetchInterval:number|false=false,role:"Coder"|"Parent"="Coder"):MemberQuery<T> {
 const user:ReturnType<typeof useSupabaseUser> = useSupabaseUser();
 const headers:ReturnType<typeof useProfileAuthorization> = useProfileAuthorization();
 const cache:ReturnType<typeof useQueryClient> = useQueryClient();
 const query:ReturnType<typeof useQuery<T>> = useQuery<T>({queryKey:computed(():readonly unknown[]=>[role.toLowerCase(),user.value?.email??"",toValue(path)]),enabled:computed(():boolean=>Boolean(user.value)&&toValue(path)!==null),retry:false,refetchInterval,queryFn:async({signal}:QueryFunctionContext):Promise<T>=>schema.parse(await $fetch(`/api/${role}/${toValue(path)}`,{headers:await headers(),signal}))});
 /** Invalidate member queries after local writes or relevant realtime events. */
 async function refresh():Promise<void> { await cache.invalidateQueries({queryKey:[role.toLowerCase()]}); }
 const realtime:ReturnType<typeof UseSupabaseRealtimeAllTables> = UseSupabaseRealtimeAllTables();
 /** Refresh when membership, team, achievement or session records change. */
 function invalidate(event:{table:string}):void { if (["members","member_parents","teams","belts","badges","badge_categories","member_belts","member_badges","member_attendances","sessions","session_pods"].includes(event.table)) void refresh(); }
 realtime.events.on("INSERT",invalidate);realtime.events.on("UPDATE",invalidate);realtime.events.on("DELETE",invalidate);
 onScopeDispose(():void=>{realtime.events.off("INSERT",invalidate);realtime.events.off("UPDATE",invalidate);realtime.events.off("DELETE",invalidate);});
 return {data:computed(():T|null=>query.isError.value ? null : query.data.value??null),isPending:query.isPending,isError:query.isError,refresh};
}
