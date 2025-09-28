import type { H3Event, EventHandlerRequest } from "h3";
import { GetSupabaseAdminClient } from "./DatabaseClient";
import type { Database } from "../../types/supabase";
import { memberAttendanceFromRecords, MemberAttendanceModelArray, memberAttendanceToRecords, type MemberAttendanceModel } from "~~/shared/types/models/MemberAttendanceModel";
import { DateString, TodayYYYY_MM_dd } from "~~/shared/utils/DateHelpers";

export type MemberAttendanceRecord = Database["coderdojo"]["Tables"]["member_attendances"]["Row"];

export const MemberAttendancesData = {
	
	/**
	 * Get all member attendances
	 * ToDo: Probably want a more focused query here in future
	 */
	GetMemberAttendancesForMember: async (
		event: H3Event<EventHandlerRequest>,
		memberId: string
	): Promise<MemberAttendanceModelArray> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) return [];
		try {
			const { data, error } = await supabase
				.schema("coderdojo")
				.from("member_attendances")
				.select("*")
				.eq("member_id", memberId);
			if (error || !data || data.length === 0) {
				console.error("Error fetching member attendances:", error);
				return [];
			}
			return memberAttendanceFromRecords(data as any);
		} catch (error: any) {
			throw new Error(`Error fetching member attendances: ${error?.message}`);
		}
	},

	/**
	 * Get the count of all member attendances for a specific member
	 */
	GetMemberAttendancesCountForMember: async (
		event: H3Event<EventHandlerRequest>,
		memberId: string
	): Promise<number> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) return 0;
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
		} catch (error: any) {
			console.error(`Error fetching member attendance count: ${error?.message}`);
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
		dateToInclude?: DateString
	): Promise<DateString[]> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) return [];
		try {
			// Use the RPC to get distinct dates (no paging)
			const { data, error: rpcError } = await supabase
				.schema("coderdojo")
				.rpc('get_attendance_dates');

			if (rpcError) {
				console.error('Error fetching attendance dates via RPC:', rpcError);
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
		} catch (error: any) {
			console.error(`Error fetching attendance session dates: ${error?.message}`);
			return [];
		}
	},

	/**
	 * Create a new member attendance record (if one doesn't already exist for that member/date)
	 */
	CreateMemberAttendance: async (
		event: H3Event<EventHandlerRequest>,
		memberId: string,
		date?: string
	): Promise<MemberAttendanceModel | null> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) return null;
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
		} catch (error: any) {
			console.error(`Error creating member attendance: ${error?.message}`);
			return null;
		}
	},

	/**
	 * Save one member attendance
	 */
	SaveMemberAttendance: async (
		event: H3Event<EventHandlerRequest>,
		attendance: MemberAttendanceModel
	): Promise<MemberAttendanceModel | null> => {
		const all = await MemberAttendancesData.SaveMemberAttendances(event, [attendance]);
		return all[0] || null;
	},

	/**
	 * Save an array of member attendances
	 */
	SaveMemberAttendances: async (
		event: H3Event<EventHandlerRequest>,
		attendances: MemberAttendanceModel[]
	): Promise<MemberAttendanceModel[]> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) return [];
		try {
			const { data, error } = await supabase.schema("coderdojo").from("member_attendances").upsert(memberAttendanceToRecords(attendances) as any, { onConflict: "id" }).select();
			if (error || !data || data.length === 0) {
				console.error("Error saving member attendances:", error);
				return [];
			}
			return memberAttendanceFromRecords(data as any);
		} catch (error: any) {
			throw new Error(`Error saving member attendances: ${error?.message}`);
		}
	},

	/**
	 * Delete one member attendance by ID
	 */
	DeleteMemberAttendance: async (
		event: H3Event<EventHandlerRequest>,
		attendanceId: string
	): Promise<boolean> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) return false;
		try {
			const { error } = await supabase.schema("coderdojo").from("member_attendances").delete().eq("id", attendanceId);
			if (error) {
				console.error("Error deleting member attendance:", error);
				return false;
			}
			return true;
		} catch (error: any) {
			console.error(`Error deleting member attendance: ${error?.message}`);
			return false;
		}
	},
};
