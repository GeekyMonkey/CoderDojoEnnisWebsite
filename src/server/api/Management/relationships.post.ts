import { defineEventHandler, type H3Event } from "h3";
import { maintenanceActor, maintenanceBody } from "#server/utils/maintenanceRequest";
import { maintainMember } from "#server/db/MemberMaintenanceData";
import { relationshipInputSchema, type RelationshipInput } from "#shared/types/MemberMaintenance";

/** Link a validated relationships assignment without duplicate rows. */
export default defineEventHandler(async (event: H3Event): Promise<null> => {
 const actor: Awaited<ReturnType<typeof maintenanceActor>> = await maintenanceActor(event);
 const body: RelationshipInput = await maintenanceBody(event, relationshipInputSchema);
 await maintainMember(actor, "link", body.memberId, { parent_id: body.parentId });
 return null;
});
