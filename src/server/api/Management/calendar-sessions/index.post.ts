import { defineEventHandler, type H3Event } from "h3";
import {
	maintenanceActor,
	maintenanceBody,
	maintenanceId,
} from "#server/utils/maintenanceRequest";
import { maintainCalendarSession } from "#server/db/MemberCalendarData";
import {
	calendarFieldsSchema,
	type CalendarFields,
	type CalendarSession,
} from "#shared/types/MemberCalendar";
/** Create a dated session using verified mentor permissions. */
export default defineEventHandler(
	async (event: H3Event): Promise<CalendarSession | null> => {
		const actor: Awaited<ReturnType<typeof maintenanceActor>> =
			await maintenanceActor(event);
		const body: CalendarFields = await maintenanceBody(
			event,
			calendarFieldsSchema,
		);
		return maintainCalendarSession(actor, "create", null, body, null);
	},
);
