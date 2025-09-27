import type { H3Event, EventHandlerRequest } from "h3";
import { GetSupabaseAdminClient } from "./DatabaseClient";
import type { Database } from "../../types/supabase";
import { memberAttendanceFromRecords, memberAttendanceToRecords, type MemberAttendanceModel } from "~~/shared/types/models/MemberAttendanceModel";

export type MemberAttendanceRecord = Database["coderdojo"]["Tables"]["member_attendances"]["Row"];

export const MemberAttendancesData = {
	GetMemberAttendances: async (
		event: H3Event<EventHandlerRequest>,
	): Promise<MemberAttendanceModel[]> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) return [];
		try {
			const { data, error } = await supabase.schema("coderdojo").from("member_attendances").select("*");
			if (error || !data || data.length === 0) {
				console.error("Error fetching member attendances:", error);
				return [];
			}
			return memberAttendanceFromRecords(data as any);
		} catch (error: any) {
			throw new Error(`Error fetching member attendances: ${error?.message}`);
		}
	},
	SaveMemberAttendance: async (
		event: H3Event<EventHandlerRequest>,
		attendance: MemberAttendanceModel
	): Promise<MemberAttendanceModel | null> => {
		const all = await MemberAttendancesData.SaveMemberAttendances(event, [attendance]);
		return all[0] || null;
	},
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
