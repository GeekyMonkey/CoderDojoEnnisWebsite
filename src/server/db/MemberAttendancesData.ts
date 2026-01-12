import type { EventHandlerRequest, H3Event } from "h3";
import {
	type MemberAttendanceModel,
	type MemberAttendanceModelArray,
	memberAttendanceFromRecords,
	memberAttendanceToRecords,
} from "~~/shared/types/models/MemberAttendanceModel";
import { type DateString, TodayYYYY_MM_dd } from "~~/shared/utils/DateHelpers";
import { ErrorToString } from "~~/shared/utils/ErrorHelpers";
import type { Database } from "../../types/supabase";
import { GetSupabaseAdminClient } from "./DatabaseClient";

export type MemberAttendanceRecord =
	Database["coderdojo"]["Tables"]["member_attendances"]["Row"];

export const MemberAttendancesData = {
	/**
	 * Get all member attendances for a specified date
	 */
	GetMemberAttendancesForDate: async (
		event: H3Event<EventHandlerRequest>,
		date: string,
	): Promise<MemberAttendanceModelArray> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) {
			return [];
		}
		try {
			const { data, error } = await supabase
				.schema("coderdojo")
				.from("member_attendances")
				.select("*")
				.eq("date", date);
			if (error || !data || data.length === 0) {
				console.error("Error fetching member attendances for date:", error);
				return [];
			}
			return memberAttendanceFromRecords(data as any);
		} catch (error) {
			throw new Error(
				`Error fetching member attendances for date: ${ErrorToString(error)}`,
			);
		}
	},

	/**
	 * Get all member attendances between two dates (inclusive)
	 */
	GetMemberAttendancesForDateRange: async (
		event: H3Event<EventHandlerRequest>,
		dateMin: string,
		dateMax: string,
	): Promise<MemberAttendanceModelArray> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) {
			return [];
		}
		try {
			const { data, error } = await supabase
				.schema("coderdojo")
				.from("member_attendances")
				.select("*")
				.gte("date", dateMin)
				.lte("date", dateMax)
				.order("date", { ascending: true });
			if (error || !data || data.length === 0) {
				console.error(
					"Error fetching member attendances for date range:",
					error,
				);
				return [];
			}
			return memberAttendanceFromRecords(data as any);
		} catch (error) {
			throw new Error(
				`Error fetching member attendances for date range: ${ErrorToString(error)}`,
			);
		}
	},

	/**
	 * Get all member attendances for the date of the most recent session
	 */
	GetMemberAttendancesForMostRecentSession: async (
		event: H3Event<EventHandlerRequest>,
	): Promise<MemberAttendanceModelArray> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) {
			return [];
		}
		try {
			const sessionDates =
				await MemberAttendancesData.GetAttendanceSessionDates(event);
			const mostRecentDate = sessionDates[0];
			if (!mostRecentDate) {
				console.error("No most recent attendance date found");
				return [];
			}

			return await MemberAttendancesData.GetMemberAttendancesForDate(
				event,
				mostRecentDate,
			);
		} catch (error) {
			console.error(
				`Error fetching member attendances for most recent session: ${ErrorToString(error)}`,
			);
			return [];
		}
	},

	/**
	 * Get all member attendances
	 * ToDo: Probably want a more focused query here in future
	 */
	GetMemberAttendancesForMember: async ({
		event,
		memberId,
		maxCount = null,
	}: {
		event: H3Event<EventHandlerRequest>;
		memberId: string;
		maxCount: number | null;
	}): Promise<MemberAttendanceModelArray> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) {
			return [];
		}
		try {
			let query = supabase
				.schema("coderdojo")
				.from("member_attendances")
				.select("*")
				.eq("member_id", memberId)
				.order("date", { ascending: false });
			if (maxCount && maxCount > 0) {
				query = query.limit(maxCount);
			}
			const { data, error } = await query;
			if (error || !data || data.length === 0) {
				console.error("Error fetching member attendances:", error);
				return [];
			}
			return memberAttendanceFromRecords(
				data as unknown as MemberAttendanceRecord[],
			);
		} catch (error) {
			throw new Error(
				`Error fetching member attendances: ${ErrorToString(error)}`,
			);
		}
	},

	/**
	 * Get the count of all member attendances for a specific member
	 */
	GetMemberAttendancesCountForMember: async (
		event: H3Event<EventHandlerRequest>,
		memberId: string,
	): Promise<number> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) {
			return 0;
		}
		try {
			const { count, error } = await supabase
				.schema("coderdojo")
				.from("member_attendances")
				.select("*", { count: "exact", head: true })
				.eq("member_id", memberId);
			if (error) {
				console.error("Error fetching member attendance count:", error);
				return 0;
			}
			return count || 0;
		} catch (error) {
			console.error(
				`Error fetching member attendance count: ${ErrorToString(error)}`,
			);
			return 0;
		}
	},

	/**
	 * Get a list of all of the CoderDojo sessions that have been held
	 * Not from the sessions table, but from the member and adult attendances
	 * This is used to populate the session filter dropdown on the attendance page
	 * and to show the list of sessions on the reports page
	 */
	GetAttendanceSessionDates: async (
		event: H3Event<EventHandlerRequest>,
		dateToInclude?: DateString,
	): Promise<DateString[]> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) {
			return [];
		}
		try {
			// Use the RPC to get distinct dates (no paging)
			const { data, error: rpcError } = await supabase
				.schema("coderdojo")
				.rpc("get_attendance_dates");

			if (rpcError) {
				console.error("Error fetching attendance dates via RPC:", rpcError);
				return [];
			}

			const allDates: DateString[] = (data || []).map((r: any) => r.date);

			// Ensure the dateToInclude is in the list
			if (dateToInclude) {
				allDates.push(dateToInclude);
			}
			// Extract unique dates
			const uniqueDates: DateString[] = Array.from(new Set(allDates));
			return uniqueDates;
		} catch (error) {
			console.error(
				`Error fetching attendance session dates: ${ErrorToString(error)}`,
			);
			return [];
		}
	},

	/**
	 * Get attendance stats per session date (date + attendance_count)
	 */
	GetAttendanceSessionStats: async (
		event: H3Event<EventHandlerRequest>,
	): Promise<
		{
			date: DateString;
			mentor_count: number;
			ninja_count: number;
			total_count: number;
		}[]
	> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) {
			return [];
		}
		try {
			const { data, error: rpcError } = await supabase
				.schema("coderdojo")
				.rpc("get_attendance_stats_split");

			if (rpcError) {
				console.error(
					"Error fetching split attendance stats via RPC:",
					rpcError,
				);
				return [];
			}

			const stats = (data || []).map((r: any) => ({
				date: r.date as DateString,
				mentor_count:
					typeof r.mentor_count === "string"
						? Number(r.mentor_count)
						: r.mentor_count || 0,
				ninja_count:
					typeof r.ninja_count === "string"
						? Number(r.ninja_count)
						: r.ninja_count || 0,
				total_count:
					typeof r.total_count === "string"
						? Number(r.total_count)
						: r.total_count || 0,
			}));

			return stats;
		} catch (error) {
			console.error(
				`Error fetching attendance session stats: ${ErrorToString(error)}`,
			);
			return [];
		}
	},

	/**
	 * Create a new member attendance record (if one doesn't already exist for that member/date)
	 */
	CreateMemberAttendance: async (
		event: H3Event<EventHandlerRequest>,
		memberId: string,
		date?: string,
	): Promise<MemberAttendanceModel | null> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) {
			return null;
		}
		try {
			// Upsert matching on member_id and date (so we don't duplicate attendances for same member/day)
			const record = {
				member_id: memberId,
				date: date || TodayYYYY_MM_dd(),
			};
			const { data, error } = await supabase
				.schema("coderdojo")
				.from("member_attendances")
				.upsert(record, { onConflict: "member_id,date" })
				.select();
			if (error || !data || data.length === 0) {
				console.error("Error creating member attendance:", error);
				return null;
			}
			return memberAttendanceFromRecords(data as any)[0];
		} catch (error) {
			console.error(
				`Error creating member attendance: ${ErrorToString(error)}`,
			);
			return null;
		}
	},

	/**
	 * Save one member attendance
	 */
	SaveMemberAttendance: async (
		event: H3Event<EventHandlerRequest>,
		attendance: MemberAttendanceModel,
	): Promise<MemberAttendanceModel | null> => {
		const all = await MemberAttendancesData.SaveMemberAttendances(event, [
			attendance,
		]);
		return all[0] || null;
	},

	/**
	 * Save an array of member attendances
	 */
	SaveMemberAttendances: async (
		event: H3Event<EventHandlerRequest>,
		attendances: MemberAttendanceModel[],
	): Promise<MemberAttendanceModel[]> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) {
			return [];
		}
		try {
			const { data, error } = await supabase
				.schema("coderdojo")
				.from("member_attendances")
				.upsert(memberAttendanceToRecords(attendances) as any, {
					onConflict: "id",
				})
				.select();
			if (error || !data || data.length === 0) {
				console.error("Error saving member attendances:", error);
				return [];
			}
			return memberAttendanceFromRecords(data as any);
		} catch (error) {
			throw new Error(
				`Error saving member attendances: ${ErrorToString(error)}`,
			);
		}
	},

	/**
	 * Delete one member attendance by ID
	 */
	DeleteMemberAttendance: async (
		event: H3Event<EventHandlerRequest>,
		attendanceId: string,
	): Promise<boolean> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) {
			return false;
		}
		try {
			const { error } = await supabase
				.schema("coderdojo")
				.from("member_attendances")
				.delete()
				.eq("id", attendanceId);
			if (error) {
				console.error("Error deleting member attendance:", error);
				return false;
			}
			return true;
		} catch (error) {
			console.error(
				`Error deleting member attendance: ${ErrorToString(error)}`,
			);
			return false;
		}
	},
};
