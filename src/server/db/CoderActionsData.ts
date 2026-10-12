import { createError } from "h3";
import type { VerifiedMember } from "#server/utils/requestMember";
import type { Json } from "../../types/supabase";
/** Execute an atomic own-coder action and map expected validation/conflict failures. */
export async function coderAction(actor:VerifiedMember,action:"goals"|"goal"|"apply",kind:"badge"|"belt"|null,definitionId:string|null,fields:Json,expected:Json={}):Promise<Json|null> {
 const {data,error} = await actor.client.schema("coderdojo").rpc("coder_action",{p_actor:actor.id,p_action:action,p_kind:kind,p_definition:definitionId,p_fields:fields,p_expected:expected});
 if (error) throw createError({statusCode:error.code==="42501"?403:error.code==="P0002"?404:error.code==="P0001"?409:error.code==="22023"?400:503,statusMessage:["42501","P0002","P0001","22023"].includes(error.code)?error.message:"Unable to save coder changes"});
 return data??null;
}
