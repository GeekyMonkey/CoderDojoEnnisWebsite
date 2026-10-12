import { computed, toValue, type MaybeRefOrGetter } from "vue";
import { z } from "zod";
import { childSummarySchema, parentChildSchema, type ChildSummary, type ParentChild } from "#shared/types/Parent";
import { profileIdentitySchema } from "#shared/types/MemberProfile";
import { useMemberQuery, type MemberQuery } from "./useMemberQuery";
/** Cache the real linked-child directory and refresh it after relationship changes. */
export function useParentChildrenStore():MemberQuery<ChildSummary[]>{return useMemberQuery("children",z.array(childSummarySchema),false,"Parent");}
/** Cache selected child context only for a validated identity. */
export function useParentChildStore(memberId:MaybeRefOrGetter<string>):MemberQuery<ParentChild>{return useMemberQuery(computed(():string|null=>profileIdentitySchema.safeParse(toValue(memberId)).success?`children/${toValue(memberId)}`:null),parentChildSchema,false,"Parent");}
