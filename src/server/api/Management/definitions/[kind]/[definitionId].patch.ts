import { defineEventHandler, type H3Event } from "h3";
import { maintenanceActor, maintenanceBody } from "#server/utils/maintenanceRequest";
import { definitionKind, definitionId } from "#server/utils/definitionRequest";
import { maintainDefinition } from "#server/db/DefinitionMaintenanceData";
import { definitionUpdateSchema, type DefinitionKind, type Definition, type DefinitionUpdate } from "#shared/types/DefinitionMaintenance";
/** Apply a strict update request for the verified current mentor. */
export default defineEventHandler(async(event: H3Event): Promise<Definition> => {
 const actor: Awaited<ReturnType<typeof maintenanceActor>> = await maintenanceActor(event);
 const kind: DefinitionKind = definitionKind(event);
 const id: string = definitionId(event);
 const body: DefinitionUpdate = await maintenanceBody(event,definitionUpdateSchema(kind));
 return maintainDefinition(actor,kind,"update",id,body.fields,body.expected);
});
