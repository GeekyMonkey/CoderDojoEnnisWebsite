import { defineEventHandler, type H3Event } from "h3";
import { requireRequestParent } from "#server/utils/parentRequest";
import { readChildren } from "#server/db/ParentData";
import { childSummarySchema, type ChildSummary } from "#shared/types/Parent";
/** List only the verified parent's active linked children. */
export default defineEventHandler(async(event:H3Event):Promise<ChildSummary[]>=>childSummarySchema.array().parse(await readChildren(await requireRequestParent(event))));
