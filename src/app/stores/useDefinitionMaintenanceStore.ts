import { useMutation, useQuery, useQueryClient, type QueryFunctionContext } from "@tanstack/vue-query";
import { computed, onScopeDispose, type ComputedRef, type Ref } from "vue";
import { definitionSchema, definitionListSchema, definitionKindSchema, definitionIdSchema, definitionFieldsSchema, definitionUpdateSchema, definitionDeleteSchema, type Definition, type DefinitionKind, type DefinitionFields, type DefinitionUpdate, type DefinitionDelete } from "#shared/types/DefinitionMaintenance";
import { useProfileAuthorization } from "~/composables/useProfileAuthorization";
import { UseSupabaseRealtimeAllTables } from "~/composables/UseSupabaseRealtimeAllTables";
import { entityImageActionSchema, type EntityImageAction } from "#shared/types/ImageUpload";
type DefinitionWrite = { path: string; method: "POST" | "PATCH" | "DELETE"; body: DefinitionFields | DefinitionUpdate | DefinitionDelete | EntityImageAction };
type DefinitionMaintenanceStore = {
 definitions: ComputedRef<Definition[]>; byId: ComputedRef<Record<string, Definition>>; categories: ComputedRef<Definition[]>; isPending: Ref<boolean>; isError: Ref<boolean>; isSaving: Ref<boolean>;
 changeImage: (id: string, action: EntityImageAction) => Promise<Definition>;
 create: (kind: DefinitionKind, fields: DefinitionFields) => Promise<Definition>; save: (kind: DefinitionKind, id: string, body: DefinitionUpdate) => Promise<Definition>; remove: (kind: DefinitionKind, id: string, body: DefinitionDelete) => Promise<Definition>;
};
/** Own definition requests, validated query caching and realtime refresh for dependent views. */
export function useDefinitionMaintenanceStore(): DefinitionMaintenanceStore {
 const user: ReturnType<typeof useSupabaseUser> = useSupabaseUser();
 const headers: ReturnType<typeof useProfileAuthorization> = useProfileAuthorization();
 const client: ReturnType<typeof useQueryClient> = useQueryClient();
 const query: ReturnType<typeof useQuery<Definition[]>> = useQuery<Definition[]>({
  queryKey: computed((): readonly unknown[] => ["definitionMaintenance", user.value?.email ?? ""]), enabled: computed((): boolean => Boolean(user.value)), staleTime: 30_000, retry: false,
  queryFn: async ({ signal }: QueryFunctionContext): Promise<Definition[]> => definitionListSchema.parse(await $fetch("/api/Management/definitions", { headers: await headers(), signal })),
 });
 /** Refresh definitions, categories, reviews and profile skill lookups after changes. */
 async function reload(): Promise<void> { await Promise.all(["definitionMaintenance","belts","badges","badge_categories","badgeCategories","memberMaintenance","achievementReviews","memberBadgesByMemberId","memberBeltsByMemberId","memberBeltsLatest","memberBeltsPending"].map((key: string): Promise<void> => client.invalidateQueries({ queryKey: [key] }))); }
 const mutation: ReturnType<typeof useMutation<Definition, Error, DefinitionWrite>> = useMutation<Definition, Error, DefinitionWrite>({
  mutationFn: async (write: DefinitionWrite): Promise<Definition> => definitionSchema.parse(await $fetch(`/api/Management/definitions${write.path}`, { method: write.method, headers: await headers(), body: write.body })), onSettled: reload,
 });
 /** Create a definition using the selected kind's strict contract. */
 async function create(kind: DefinitionKind, fields: DefinitionFields): Promise<Definition> { return mutation.mutateAsync({ path: `/${definitionKindSchema.parse(kind)}`, method: "POST", body: definitionFieldsSchema(kind).parse(fields) }); }
 /** Save a definition only while its expected snapshot remains current. */
 async function save(kind: DefinitionKind, id: string, body: DefinitionUpdate): Promise<Definition> { return mutation.mutateAsync({ path: `/${definitionKindSchema.parse(kind)}/${definitionIdSchema.parse(id)}`, method: "PATCH", body: definitionUpdateSchema(kind).parse(body) }); }
 /** Soft-delete the confirmed definition without deleting achievement history. */
 async function remove(kind: DefinitionKind, id: string, body: DefinitionDelete): Promise<Definition> { return mutation.mutateAsync({ path: `/${definitionKindSchema.parse(kind)}/${definitionIdSchema.parse(id)}`, method: "DELETE", body: definitionDeleteSchema.parse(body) }); }
 /** Save or delete a category image through the shared guarded image contract. */
 async function changeImage(id: string, action: EntityImageAction): Promise<Definition> { return mutation.mutateAsync({ path: `/category/${definitionIdSchema.parse(id)}/image`,method:"POST",body:entityImageActionSchema.parse(action) }); }
 const definitions: ComputedRef<Definition[]> = computed((): Definition[] => query.data.value ?? []);
 const byId: ComputedRef<Record<string, Definition>> = computed((): Record<string, Definition> => Object.fromEntries(definitions.value.map((value: Definition): [string, Definition] => [value.id,value])));
 const categories: ComputedRef<Definition[]> = computed((): Definition[] => definitions.value.filter((value: Definition): boolean => value.kind === "category").sort((a: Definition,b: Definition): number => a.name.localeCompare(b.name)));
 const realtime: ReturnType<typeof UseSupabaseRealtimeAllTables> = UseSupabaseRealtimeAllTables();
 /** Refresh definition and award views after relevant remote database events. */
 function invalidate(event: { table: string }): void { if (["belts","badges","badge_categories","member_badges","member_belts","member_badge_categories"].includes(event.table)) void reload(); }
 realtime.events.on("INSERT",invalidate); realtime.events.on("UPDATE",invalidate); realtime.events.on("DELETE",invalidate);
 onScopeDispose((): void => { realtime.events.off("INSERT",invalidate); realtime.events.off("UPDATE",invalidate); realtime.events.off("DELETE",invalidate); });
 return { definitions,byId,categories,isPending:query.isPending,isError:query.isError,isSaving:mutation.isPending,create,save,remove,changeImage };
}
