import { defineEventHandler, setResponseHeader, type H3Event } from "h3";
import { maintenanceActor } from "#server/utils/maintenanceRequest";
import { readDefinitions } from "#server/db/DefinitionMaintenanceData";
import type { Definition } from "#shared/types/DefinitionMaintenance";
/** Load active achievement definitions only for a verified current mentor. */
export default defineEventHandler(async(event: H3Event): Promise<Definition[]> => { const actor: Awaited<ReturnType<typeof maintenanceActor>> = await maintenanceActor(event); setResponseHeader(event,"Cache-Control","private, no-store"); return readDefinitions(actor); });
