import { defineEventHandler, type H3Event } from "h3";
import { requireRequestCoder } from "#server/utils/coderRequest";
import { readCoderContext } from "#server/db/CoderData";
import type { CoderContext } from "#shared/types/Coder";
/** Load the signed-in coder's profile and public team context. */
export default defineEventHandler(async(event:H3Event):Promise<CoderContext> => readCoderContext(await requireRequestCoder(event)));
