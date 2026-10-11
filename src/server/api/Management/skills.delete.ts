import { defineEventHandler, type H3Event } from "h3";
import { maintenanceActor, maintenanceBody } from "#server/utils/maintenanceRequest";
import { maintainMember } from "#server/db/MemberMaintenanceData";
import { skillInputSchema, type SkillInput } from "#shared/types/MemberMaintenance";

/** Unskill a validated skills assignment without duplicate rows. */
export default defineEventHandler(async (event: H3Event): Promise<null> => {
 const actor: Awaited<ReturnType<typeof maintenanceActor>> = await maintenanceActor(event);
 const body: SkillInput = await maintenanceBody(event, skillInputSchema);
 await maintainMember(actor, "unskill", body.memberId, { badge_category_id: body.badgeCategoryId });
 return null;
});
