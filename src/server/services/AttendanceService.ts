import { clubToday } from "#shared/utils/CalendarDates";
import type { EventHandlerRequest, H3Event } from "h3";
import { GetSupabaseAdminClient, type SupabaseClientType } from "#server/db/DatabaseClient";
import { z } from "zod";
import type { AttendanceSignInResponseModel } from "#shared/types/AttendanceModels";
import {
	memberFromRecord,
 type MemberRecord,
	type MemberModel,
} from "#shared/types/models/MemberModel";
import { TimestampToDateString } from "#shared/utils/DateHelpers";
import { MemberBadgesData } from "../db/MemberBadgesData";
import { MemberBeltsData } from "../db/MemberBeltsData";

type AttendanceCommit = { member: MemberModel; sessionCount: number };

// Validate the service-only commit response and discard all credential hash fields.
const attendanceCommitSchema: z.ZodType<AttendanceCommit> = z.object({
 member: z.object({ id: z.string() }).passthrough().transform((record: Record<string, unknown> & { id: string }, context: z.RefinementCtx): MemberModel | typeof z.NEVER => {
  try { return memberFromRecord(record as MemberRecord); }
  catch { context.addIssue({ code: "custom", message: "Invalid committed member" }); return z.NEVER; }
 }),
 sessionCount: z.number().int().min(1),
});

export class AttendanceServiceError extends Error {
	constructor(
		message: string,
		public readonly code: string,
	) {
		super(message);
		this.name = "AttendanceServiceError";
	}
}

export class AttendanceService {
	constructor(private readonly event: H3Event<EventHandlerRequest>) {}

	/**
	 * Sign a member in (create attendance record, update login dates, return response)
	 * @param member Member model to sign in
	 * @param testing If true, do not persist attendance record, but simulate increment
	 */
	async signInMember(
		member: MemberModel,
		testing: boolean = false,
	): Promise<AttendanceSignInResponseModel> {
		const logs: string[] = [];

		if (!member) {
			throw new AttendanceServiceError("Member not provided", "NO_MEMBER");
		}

		const todayString: string = clubToday();
  const client: SupabaseClientType | null = await GetSupabaseAdminClient(this.event);
  if (!client) throw new AttendanceServiceError("Unable to record sign-in", "SIGN_IN_FAILED");
  const { data, error } = await client.schema("coderdojo").rpc("sign_in_attendance", {
   p_member: member.id, p_date: todayString, p_testing: testing,
  });
  if (error) throw new AttendanceServiceError("Unable to record sign-in", "SIGN_IN_FAILED");
  const result: ReturnType<typeof attendanceCommitSchema.safeParse> = attendanceCommitSchema.safeParse(data);
  if (!result.success || result.data.member.id !== member.id) throw new AttendanceServiceError("Unable to confirm sign-in", "SIGN_IN_FAILED");
  // Use the committed current account, never the stale lookup snapshot or its fields.
  member = result.data.member;
  const sessionCount: number = result.data.sessionCount;
  logs.push(testing ? `[Testing mode] Attendance record not created for ${todayString}` : `Attendance recorded for ${todayString}`);

		const {
			message,
			notifications,
			logs: notificationLogs,
		} = await this.GenerateAttendanceNotifications(member, sessionCount);
		logs.push(...notificationLogs);

		const response: AttendanceSignInResponseModel = {
			memberId: member.id,
			memberName: `${member.nameFirst} ${member.nameLast}`.trim(),
			memberSessionCount: sessionCount,
			memberMessage: message,
			memberDetails: member,
			notifications: notifications,
			logs,
		};
		return response;
	}

	/**
	 * Generate attendance notifications based on session count
	 * Includes a simple greeting for the fingerprint response
	 * And a detailed array of messages
	 */
	async GenerateAttendanceNotifications(
		member: MemberModel,
		sessionCount: number,
	): Promise<{
		message: string;
		notifications: AttendanceNotificationArray;
		logs: string[];
	}> {
		let message: string = "";
		let notifications: AttendanceNotificationArray = [];
		let logs: string[] = [];

		// Decide which generator to use based on whether the member is a Ninja (youth) or an Adult (mentor/parent)
		if (member.isNinja) {
			({ message, notifications, logs } =
				await this.GenerateAttendanceNotificationsForNinja(
					member,
					sessionCount,
				));
		} else {
			({ message, notifications, logs } =
				await this.GenerateAttendanceNotificationForAdult(
					member,
					sessionCount,
				));
		}
		return {
			message,
			notifications: notifications.filter((n) => !!n.message),
			logs,
		};
	}

	/**
	 * Generate notifications for a Ninja (youth member)
	 * @remarks Keep messages short & encouraging for display on kiosk / fingerprint scanner
	 */
	private async GenerateAttendanceNotificationsForNinja(
		member: MemberModel,
		sessionCount: number,
	): Promise<{
		message: string;
		notifications: AttendanceNotificationArray;
		logs: string[];
	}> {
		const logs: string[] = [];
		let message = "";
		const notifications: AttendanceNotificationArray = [];

		// Base greeting (short, shown on hardware device)
		if (sessionCount <= 1) {
			message = "Welcome to your first session!";
		} else if (sessionCount == 2) {
			message = `Glad you decided to come back!`;
		} else if (sessionCount < 5) {
			message = `Great to see you again!`;
		} else if (sessionCount === 5) {
			message = "High-five for 5 sessions!";
		} else if (sessionCount === 10) {
			message = "10 sessions! You're leveling up!";
		} else if (sessionCount === 25) {
			message = "25 sessions! Dedication!";
		} else if (sessionCount === 50) {
			message = "50 sessions! Ninja Master!";
		} else {
			message = `Welcome back (Session #${sessionCount})!`;
		}

		notifications.push({ type: "GREETING", message });

		// Milestone notifications (keep separate from GREETING so UI can style)
		const milestoneMap: Record<number, string> = {
			1: "This is your first session – awesome start!",
			5: "5 sessions – Ask a mentor about requesting your white belt!",
			10: "10 sessions – double digits!",
			25: "25 sessions – quarter to a hundred!",
			50: "50 sessions – half a century of coding!",
			100: "100 sessions – incredible commitment!",
		};
		if (milestoneMap[sessionCount]) {
			notifications.push({
				type: "MILESTONE",
				message: milestoneMap[sessionCount],
			});
		}

		// Look for recent badge or belt achievements to notify about
		const loginDatePreviousTimestamp: number = member.loginDatePrevious || 0;
		logs.push(
			`Previous login timestamp: ${loginDatePreviousTimestamp}: ${TimestampToDateString(loginDatePreviousTimestamp)}`,
		);
		const memberNewBadges = (
			await MemberBadgesData.GetMemberBadgesByMemberId(this.event, member.id)
		).filter((b) => b.awarded && b.awarded > loginDatePreviousTimestamp);
		logs.push(`Member new badge count: ${memberNewBadges.length}`);
		for (const memberBadge of memberNewBadges) {
			notifications.push({
				type: "BADGE_EARNED",
				message: `New badge earned: ${memberBadge.badge.achievement}`,
			});
		}

		const memberNewBelts = (
			await MemberBeltsData.GetMemberBeltsByMemberId(this.event, member.id)
		).filter((b) => b.awarded && b.awarded > loginDatePreviousTimestamp);
		logs.push(`Member new belt count: ${memberNewBelts.length}`);
		for (const memberBelt of memberNewBelts) {
			notifications.push({
				type: "BELT_EARNED",
				message: `New belt earned: ${memberBelt.belt.color}`,
			});
		}

		return { message, notifications, logs };
	}

	/**
	 * Generate notifications for an Adult (mentor / parent)
	 * @remarks Tone: appreciative and concise
	 */
	private async GenerateAttendanceNotificationForAdult(
		_member: MemberModel,
		sessionCount: number,
	): Promise<{
		message: string;
		notifications: AttendanceNotificationArray;
		logs: string[];
	}> {
		const logs: string[] = [];
		let message = "";
		const notifications: AttendanceNotificationArray = [];

		if (sessionCount <= 1) {
			message = "Thanks for joining!";
		} else if (sessionCount < 5) {
			message = `We're glad you decided to come back for session ${sessionCount}.`;
		} else {
			message = `This is your ${sessionCount}th session.`;
		}

		notifications.push({ type: "GREETING", message });

		// Add distinct milestone messages (fewer than for ninjas)
		const milestones: Record<number, string> = {
			10: "10 sessions – thank you for volunteering your time!",
			25: "25 sessions – your help makes a difference.",
			50: "50 sessions – outstanding dedication!",
			100: "100 sessions – you are a pillar of this dojo!",
		};
		if (milestones[sessionCount]) {
			notifications.push({
				type: "MILESTONE",
				message: milestones[sessionCount],
			});
		}

		return { message, notifications, logs };
	}
}
