import { defineEventHandler, type H3Event } from "h3";
import { maintenanceActor, maintenanceBody } from "#server/utils/maintenanceRequest";
import { definitionKind } from "#server/utils/definitionRequest";
import { maintainDefinition } from "#server/db/DefinitionMaintenanceData";
import { definitionFieldsSchema, type DefinitionKind, type Definition, type DefinitionFields } from "#shared/types/DefinitionMaintenance";
/** Apply a strict create request for the verified current mentor. */
export default defineEventHandler(async(event: H3Event): Promise<Definition> => {
 const actor: Awaited<ReturnType<typeof maintenanceActor>> = await maintenanceActor(event);
 const kind: DefinitionKind = definitionKind(event);
 const id: string = crypto.randomUUID();
 const body: DefinitionFields = await maintenanceBody(event,definitionFieldsSchema(kind));
 return maintainDefinition(actor,kind,"create",id,body,null);
});
