import { createError, defineEventHandler, type H3Event } from "h3";
import {
	requireRequestMember,
	type VerifiedMember,
} from "#server/utils/requestMember";
import { maintenanceBody } from "#server/utils/maintenanceRequest";
import { joinOwnSession } from "#server/db/CoderSessionsData";
import {
	coderSessionJoinSchema,
	type CoderSessionJoined,
} from "#shared/types/CoderSession";
/** Join a permitted pod for any current member role. */
export default defineEventHandler(
	async (event: H3Event): Promise<CoderSessionJoined> => {
		const actor: VerifiedMember = await requireRequestMember(event);
		if (
			!actor.member.isMentor &&
			!actor.member.isParent &&
			!actor.member.isNinja
		)
			throw createError({
				statusCode: 403,
				statusMessage: "Member role required",
			});
		const body: { sessionId: string } = await maintenanceBody(
			event,
			coderSessionJoinSchema,
		);
		return joinOwnSession(actor, body.sessionId);
	},
);
