import { defineEventHandler, type H3Event } from "h3";
import { maintenanceActor, maintenanceBody } from "#server/utils/maintenanceRequest";
import { definitionKind, definitionId } from "#server/utils/definitionRequest";
import { maintainDefinition } from "#server/db/DefinitionMaintenanceData";
import { definitionDeleteSchema, type DefinitionKind, type Definition, type DefinitionDelete } from "#shared/types/DefinitionMaintenance";
/** Apply a strict delete request for the verified current mentor. */
export default defineEventHandler(async(event: H3Event): Promise<Definition> => {
 const actor: Awaited<ReturnType<typeof maintenanceActor>> = await maintenanceActor(event);
 const kind: DefinitionKind = definitionKind(event);
 const id: string = definitionId(event);
 const body: DefinitionDelete = await maintenanceBody(event,definitionDeleteSchema);
 return maintainDefinition(actor,kind,"delete",id,null,body.expected);
});
