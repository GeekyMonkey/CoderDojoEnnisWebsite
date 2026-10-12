import { createError } from "h3";
import type { VerifiedMember } from "#server/utils/requestMember";
import { definitionListSchema, definitionSchema, type Definition, type DefinitionKind, type DefinitionFields } from "#shared/types/DefinitionMaintenance";
import type { BeltRecord } from "#shared/types/models/BeltModel";
import type { BadgeRecord } from "#shared/types/models/BadgeModel";
import type { BadgeCategoryRecord } from "#shared/types/models/BadgeCategoryModel";
type TableName = "belts" | "badges" | "badge_categories" | "member_belts" | "member_badges";
type AwardRecord = { belt_id?: string | null; badge_id?: string | null; awarded: string | null };
type DefinitionAction = "create" | "update" | "delete";
/** Read complete active tables without silently truncating at the API row limit. */
async function readRows<T>(actor: VerifiedMember, table: TableName): Promise<T[]> {
 const rows: T[] = [];
 for (let offset: number = 0; ; offset += 500) {
  const awardTable: boolean = table === "member_belts" || table === "member_badges";
  const query: ReturnType<ReturnType<ReturnType<VerifiedMember["client"]["schema"]>["from"]>["select"]> = actor.client.schema("coderdojo").from(table).select("*").order("id").range(offset,offset+499);
  if (awardTable) query.not("awarded","is",null); else query.eq("deleted",false);
  const { data, error } = await query;
  if (error || !data) throw createError({ statusCode: 503, statusMessage: "Unable to load achievement definitions" });
  rows.push(...data as T[]); if (data.length < 500) return rows;
 }
}
/** Load normalized definitions and category lookups for the maintenance store. */
export async function readDefinitions(actor: VerifiedMember): Promise<Definition[]> {
 const [belts,badges,categories,beltAwards,badgeAwards] = await Promise.all([readRows<BeltRecord>(actor,"belts"),readRows<BadgeRecord>(actor,"badges"),readRows<BadgeCategoryRecord>(actor,"badge_categories"),readRows<AwardRecord>(actor,"member_belts"),readRows<AwardRecord>(actor,"member_badges")]);
 const counts: Record<string, number> = {};
 for (const award of [...beltAwards,...badgeAwards]) { const id: string | null = award.belt_id ?? award.badge_id ?? null; if (id && award.awarded) counts[id] = (counts[id] ?? 0) + 1; }
 return definitionListSchema.parse([
  ...belts.map((row: BeltRecord): Definition => ({ id: row.id,hasImage:false,imageRevision:null,kind:"belt",deleted:false,awardedCount:counts[row.id]??0,name:row.color??"",description:row.description,hexCode:row.hex_code,sortOrder:row.sort_order,categoryId:null })),
  ...badges.map((row: BadgeRecord): Definition => ({ id: row.id,hasImage:false,imageRevision:null,kind:"badge",deleted:false,awardedCount:counts[row.id]??0,name:row.achievement??"",description:row.description,hexCode:null,sortOrder:null,categoryId:row.badge_category_id })),
  ...categories.map(categoryDefinition),
 ]);
}
/** Normalize category text and image metadata through the shared output contract. */
export function categoryDefinition(row: BadgeCategoryRecord): Definition {
 return definitionSchema.parse({ id: row.id,kind:"category",deleted:row.deleted,hasImage:row.has_image,imageRevision:row.image_revision,awardedCount:0,name:row.category_name??"",description:row.category_description,hexCode:null,sortOrder:null,categoryId:null });
}
/** Save or soft-delete a definition atomically with mentor and snapshot checks. */
export async function maintainDefinition(actor: VerifiedMember,kind: DefinitionKind,action: DefinitionAction,id: string,fields: DefinitionFields|null,expected: DefinitionFields|null): Promise<Definition> {
 const {data,error} = await actor.client.schema("coderdojo").rpc("maintain_definition",{p_actor:actor.id,p_kind:kind,p_action:action,p_id:id,p_fields:fields??{},p_expected:expected??{}});
 if(error) { const status: number = error.code==="42501"?403:error.code==="P0002"?404:["P0001","23505"].includes(error.code)?409:["22023","22P02"].includes(error.code)?400:503; throw createError({statusCode:status,statusMessage:status===503?"Unable to save definition":error.message}); }
 if (kind === "category") {
  const { data: category, error: readError } = await actor.client.schema("coderdojo").from("badge_categories").select("*").eq("id",id).single();
  if (readError || !category) throw createError({ statusCode: 503, statusMessage: "Unable to load saved category" });
  return categoryDefinition(category);
 }
 return definitionSchema.parse(data);
}
