import {
	createError,
	defineEventHandler,
	getQuery,
	setResponseHeader,
	type H3Event,
} from "h3";
import {
	requireRequestMember,
	type VerifiedMember,
} from "#server/utils/requestMember";
import { readMemberCalendar } from "#server/db/MemberCalendarData";
import {
	calendarQuerySchema,
	type MemberCalendar,
} from "#shared/types/MemberCalendar";
/** Read the member Calendar without exposing private sessions to other roles. */
export default defineEventHandler(
	async (event: H3Event): Promise<MemberCalendar> => {
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
		const parsed: ReturnType<typeof calendarQuerySchema.safeParse> =
			calendarQuerySchema.safeParse(getQuery(event));
		if (!parsed.success)
			throw createError({
				statusCode: 400,
				statusMessage: "Invalid calendar filters",
			});
		setResponseHeader(event, "Cache-Control", "private, no-store");
		return readMemberCalendar(actor, parsed.data.view);
	},
);
