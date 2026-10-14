import {
	createError,
	setResponseHeader,
	defineEventHandler,
	type H3Event,
} from "h3";
import {
	maintenanceActor,
	maintenanceId,
} from "#server/utils/maintenanceRequest";
import {
	calendarSessionSchema,
	type CalendarSession,
} from "#shared/types/MemberCalendar";
/** Read a dated session for the mentor editor independently of Calendar filters. */
export default defineEventHandler(
	async (event: H3Event): Promise<CalendarSession> => {
		setResponseHeader(event, "Cache-Control", "private, no-store");
		const actor: Awaited<ReturnType<typeof maintenanceActor>> =
			await maintenanceActor(event);
		const { data, error } = await actor.readClient
			.schema("coderdojo")
			.from("sessions")
			.select("*")
			.eq("id", maintenanceId(event))
			.eq("deleted", false)
			.maybeSingle();
		if (error)
			throw createError({
				statusCode: 503,
				statusMessage: "Unable to load session",
			});
		if (!data)
			throw createError({
				statusCode: 404,
				statusMessage: "Session unavailable",
			});
		return calendarSessionSchema.parse({
			id: data.id,
			sessionDate: data.session_date,
			topic: data.topic ?? "",
			description: data.description,
			sessionType: data.session_type,
			revision: data.revision,
		});
	},
);
