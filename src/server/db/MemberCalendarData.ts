import { createError } from "h3";
import type { VerifiedMember } from "#server/utils/requestMember";
import {
	calendarSessionSchema,
	calendarEntrySchema,
	DEFAULT_TOPICS,
	type CalendarEntry,
	type CalendarView,
	memberCalendarSchema,
	type CalendarFields,
	type CalendarSession,
	type MemberCalendar,
} from "#shared/types/MemberCalendar";
import { clubToday, calendarLowerBound } from "#shared/utils/CalendarDates";
import type { CoderSession } from "#shared/types/CoderSession";
import type { Database } from "../../types/supabase";
import { readCoderSessions } from "./CoderSessionsData";
import { readSessionManagement } from "./SessionManagementData";

type SessionRecord = Database["coderdojo"]["Tables"]["sessions"]["Row"];
type PublicSessionRecord = Pick<
	SessionRecord,
	"id" | "session_date" | "topic" | "description" | "session_type"
>;
const CALENDAR_COLUMNS: "id,session_date,topic,description,session_type" =
	"id,session_date,topic,description,session_type";
/** Read just presentation columns through RLS using disjoint date windows. */
async function readCalendarEntries(
	client: VerifiedMember["readClient"],
	view: CalendarView,
	today: string,
): Promise<CalendarEntry[]> {
	const baseQuery = client
		.schema("coderdojo")
		.from("sessions")
		.select(CALENDAR_COLUMNS)
		.gte("session_date", calendarLowerBound(view === "past", today));
	let query: typeof baseQuery = baseQuery;
	if (view === "past") query = query.lt("session_date", today);
	const { data, error } = await query
		.order("session_date", { ascending: view === "future" })
		.order("id", { ascending: true });
	if (error)
		throw createError({
			statusCode: 503,
			statusMessage: "Unable to load calendar",
		});
	return ((data ?? []) as PublicSessionRecord[]).map(
		(row: PublicSessionRecord): CalendarEntry =>
			calendarEntrySchema.parse({
				id: row.id,
				sessionDate: row.session_date,
				topic: row.topic?.trim() || DEFAULT_TOPICS[row.session_type],
				description: row.description,
				sessionType: row.session_type,
			}),
	);
}
/** Read public coding/notes without member identity, pods, revisions, or management capability. */
export async function readPublicCalendar(
	client: VerifiedMember["readClient"],
	view: CalendarView,
): Promise<MemberCalendar> {
	const today: string = clubToday();
	return memberCalendarSchema.parse({
		sessions: await readCalendarEntries(client, view, today),
		pods: [],
		isMentor: false,
		today,
	});
}
/** Read member-visible entries and active pods through the current member's permissions. */
export async function readMemberCalendar(
	actor: VerifiedMember,
	view: CalendarView,
): Promise<MemberCalendar> {
	const today: string = clubToday();
	const sessions: CalendarEntry[] = await readCalendarEntries(
		actor.readClient,
		view,
		today,
	);
	const pods: (CoderSession & { mentorsOnly: boolean })[] = actor.member
		.isMentor
		? (await readSessionManagement(actor)).pods
				.filter((pod: CoderSession): boolean =>
					pod.endsAt === null
						? pod.sessionDate >= today
						: pod.endsAt > Date.now(),
				)
				.map(({ fields, ...pod }): CoderSession & { mentorsOnly: boolean } => ({
					...pod,
					mentorsOnly: fields.mentorsOnly,
				}))
		: (await readCoderSessions(actor)).map(
				(pod: CoderSession): CoderSession & { mentorsOnly: boolean } => ({
					...pod,
					mentorsOnly: false,
				}),
			);
	return memberCalendarSchema.parse({
		sessions,
		pods,
		isMentor: actor.member.isMentor,
		today,
	});
}
/** Mutate a date-only session through a fresh-role-checked transaction. */
export async function maintainCalendarSession(
	actor: VerifiedMember,
	action: "create" | "update" | "delete",
	id: string | null,
	fields: CalendarFields | null,
	expected: string | null,
): Promise<CalendarSession | null> {
	const { data, error } = await actor.client
		.schema("coderdojo")
		.rpc("maintain_calendar_session", {
			p_actor: actor.id,
			p_action: action,
			...(id ? { p_id: id } : {}),
			p_fields: fields ?? {},
			...(expected ? { p_expected: expected } : {}),
		});
	if (error)
		throw createError({
			statusCode:
				error.code === "42501"
					? 403
					: error.code === "P0002"
						? 404
						: ["P0001", "23505"].includes(error.code)
							? 409
							: error.code === "22023"
								? 400
								: 503,
			statusMessage: ["42501", "P0002", "P0001", "22023"].includes(error.code)
				? error.message
				: "Unable to save session",
		});
	if (action === "delete") return null;
	const resultId: string = (data as { id: string }).id;
	const result: { data: SessionRecord | null; error: unknown } =
		await actor.readClient
			.schema("coderdojo")
			.from("sessions")
			.select("*")
			.eq("id", resultId)
			.single();
	if (result.error || !result.data)
		throw createError({
			statusCode: 503,
			statusMessage: "Unable to load saved session",
		});
	return calendarSessionSchema.parse({
		id: result.data.id,
		sessionDate: result.data.session_date,
		topic:
			result.data.topic?.trim() || DEFAULT_TOPICS[result.data.session_type],
		description: result.data.description,
		sessionType: result.data.session_type,
		revision: result.data.revision,
	});
}
