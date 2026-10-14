import {
	createError,
	defineEventHandler,
	getQuery,
	setResponseHeader,
	type H3Event,
} from "h3";
import {
	GetSupabaseClient,
	type SupabaseClientType,
} from "#server/db/DatabaseClient";
import { readPublicCalendar } from "#server/db/MemberCalendarData";
import {
	calendarQuerySchema,
	type MemberCalendar,
} from "#shared/types/MemberCalendar";
/** Expose only the public Calendar feed through the anonymous RLS client. */
export default defineEventHandler(
	async (event: H3Event): Promise<MemberCalendar> => {
		const parsed: ReturnType<typeof calendarQuerySchema.safeParse> =
			calendarQuerySchema.safeParse(getQuery(event));
		if (!parsed.success)
			throw createError({
				statusCode: 400,
				statusMessage: "Invalid calendar filters",
			});
		const client: SupabaseClientType | null = await GetSupabaseClient(event);
		if (!client)
			throw createError({
				statusCode: 503,
				statusMessage: "Calendar unavailable",
			});
		setResponseHeader(event, "Cache-Control", "no-store");
		return readPublicCalendar(client, parsed.data.view);
	},
);
