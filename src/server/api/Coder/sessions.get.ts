import { defineEventHandler, type H3Event } from "h3";
import { requireRequestCoder } from "#server/utils/coderRequest";
import { readCoderSessions } from "#server/db/CoderSessionsData";
import type { CoderSession } from "#shared/types/CoderSession";
/** List upcoming sessions for the verified logged-in coder. */
export default defineEventHandler(async (event: H3Event): Promise<CoderSession[]> => readCoderSessions(await requireRequestCoder(event)));
