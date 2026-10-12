import { defineEventHandler, type H3Event } from "h3";
import { requireRequestParent } from "#server/utils/parentRequest";
import { maintenanceId } from "#server/utils/maintenanceRequest";
import { readParentPeer } from "#server/db/ParentData";
import { teamMemberProfileSchema, type TeamMemberProfile } from "#shared/types/Coder";
/** Read a public peer profile only within a linked child's current team. */
export default defineEventHandler(async(event:H3Event):Promise<TeamMemberProfile>=>teamMemberProfileSchema.parse(await readParentPeer(await requireRequestParent(event),maintenanceId(event))));
