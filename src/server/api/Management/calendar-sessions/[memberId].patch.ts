import { defineEventHandler, type H3Event } from "h3";
import {
	maintenanceActor,
	maintenanceBody,
	maintenanceId,
} from "#server/utils/maintenanceRequest";
import { maintainCalendarSession } from "#server/db/MemberCalendarData";
import {
	calendarUpdateSchema,
	type CalendarUpdate,
	type CalendarSession,
} from "#shared/types/MemberCalendar";
/** Update a dated session using verified mentor permissions. */
export default defineEventHandler(
	async (event: H3Event): Promise<CalendarSession | null> => {
		const actor: Awaited<ReturnType<typeof maintenanceActor>> =
			await maintenanceActor(event);
		const body: CalendarUpdate = await maintenanceBody(
			event,
			calendarUpdateSchema,
		);
		return maintainCalendarSession(
			actor,
			"update",
			maintenanceId(event),
			body.fields,
			body.expected,
		);
	},
);
