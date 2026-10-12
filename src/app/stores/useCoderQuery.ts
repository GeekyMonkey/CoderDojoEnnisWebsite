import type { MaybeRefOrGetter } from "vue";
import type { z } from "zod";
import { useMemberQuery, type MemberQuery } from "./useMemberQuery";
export type { MemberQuery as CoderQuery } from "./useMemberQuery";
/** Keep the coder-specific facade over the shared validated member-query lifecycle. */
export function useCoderQuery<T>(path:MaybeRefOrGetter<string|null>,schema:z.ZodType<T>,refetchInterval:number|false=false):MemberQuery<T>{return useMemberQuery(path,schema,refetchInterval,"Coder");}
