import { log } from "console";
import type { EventHandlerRequest, H3Event } from "h3";
import { MemberAttendancesData } from "~~/server/db/MemberAttendancesData";
import { MembersData } from "~~/server/db/MembersData";
import type { AttendanceSignInResponseModel } from "~~/shared/types/AttendanceModels";
import {
	Member_SetLoginDate,
	type MemberModel,
} from "~~/shared/types/models/MemberModel";
import { TodayYYYY_MM_dd } from "~~/shared/utils/DateHelpers";
import { MemberBadgesData } from "../db/MemberBadgesData";
import { MemberBeltsData } from "../db/MemberBeltsData";

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

		const todayString: string = TodayYYYY_MM_dd();
		if (!testing) {
			await MemberAttendancesData.CreateMemberAttendance(
				this.event,
				member.id,
				todayString,
			);
			logs.push(`Attendance record created for ${todayString}`);
		} else {
			logs.push(
				`[Testing mode] Attendance record not created for ${todayString}`,
			);
		}

		let sessionCount: number =
			await MemberAttendancesData.GetMemberAttendancesCountForMember(
				this.event,
				member.id,
			);
		if (testing) {
			sessionCount = sessionCount + 1;
		}

		Member_SetLoginDate(member as MemberModel);
		await MembersData.SaveMember(this.event, member);

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
		return { message, notifications, logs };
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
		} else if (sessionCount < 5) {
			message = `Great to see you again (Session #${sessionCount})!`;
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
			5: "5 sessions – you're getting into the groove!",
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
			message = "Thanks for joining us today.";
		} else if (sessionCount < 5) {
			message = `Welcome back (Session ${sessionCount}).`;
		} else if (sessionCount === 10) {
			message = "10 sessions – thanks for your continued support.";
		} else if (sessionCount === 25) {
			message = "25 sessions – your commitment helps the dojo thrive.";
		} else if (sessionCount === 50) {
			message = "50 sessions – we appreciate all you do.";
		} else {
			message = `Good to have you here (Session ${sessionCount}).`;
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
