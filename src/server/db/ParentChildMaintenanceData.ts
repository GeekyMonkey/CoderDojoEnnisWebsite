import {createError} from "h3";
import type {VerifiedMember} from "#server/utils/requestMember";
import {requireLinkedChild} from "#server/utils/parentRequest";
import {memberFromRecord,type MemberRecord,type MemberModel} from "#shared/types/models/MemberModel";
import type {ChildUpdate,ChildSnapshot} from "#shared/types/Parent";
import type {Json} from "../../types/supabase";
const COLUMNS:Record<keyof ChildSnapshot,string> = {birthYear:"birth_year",login:"login",githubLogin:"github_login",scratchName:"scratch_name",xboxGamertag:"xbox_gamertag"};
/** Persist a narrow parent mutation with atomic role, relationship and stale-snapshot checks. */
export async function mutateChild(actor:VerifiedMember,id:string,action:"save"|"password"|"images",fields:Json,expected:Json={}):Promise<MemberModel>{
 await requireLinkedChild(actor,id);
 const {data,error} = await actor.client.schema("coderdojo").rpc("maintain_parent_child",{p_actor:actor.id,p_id:id,p_action:action,p_fields:fields,p_expected:expected});
 if(error)throw createError({statusCode:error.code==="42501"?403:error.code==="P0002"?404:["P0001","23505"].includes(error.code)?409:error.code==="22023"?400:503,statusMessage:["42501","P0002","P0001","23505","22023"].includes(error.code)?error.message:"Unable to save child"});
 if(!data)throw createError({statusCode:503,statusMessage:"Unable to save child"});
 return memberFromRecord(data as MemberRecord);
}
/** Translate only the parent-editable fields into the RPC column allowlist. */
export async function saveChild(actor:VerifiedMember,id:string,update:ChildUpdate):Promise<MemberModel>{
 const fields:Record<string,string|number|null> = {};const expected:Record<string,string|number|null> = {};
 for(const key of Object.keys(COLUMNS) as (keyof ChildSnapshot)[]){fields[COLUMNS[key]]=update.fields[key];expected[COLUMNS[key]]=update.expected[key];}
 return mutateChild(actor,id,"save",fields,expected);
}
