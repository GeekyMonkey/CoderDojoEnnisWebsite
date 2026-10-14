import { defineEventHandler, type H3Event } from "h3";
import {
	maintenanceActor,
	maintenanceBody,
	maintenanceId,
} from "#server/utils/maintenanceRequest";
import { maintainCalendarSession } from "#server/db/MemberCalendarData";
import {
	calendarDeleteSchema,
	type CalendarDelete,
	type CalendarSession,
} from "#shared/types/MemberCalendar";
/** Delete a dated session using verified mentor permissions. */
export default defineEventHandler(
	async (event: H3Event): Promise<CalendarSession | null> => {
		const actor: Awaited<ReturnType<typeof maintenanceActor>> =
			await maintenanceActor(event);
		const body: CalendarDelete = await maintenanceBody(
			event,
			calendarDeleteSchema,
		);
		return maintainCalendarSession(
			actor,
			"delete",
			maintenanceId(event),
			null,
			body.expected,
		);
	},
);
