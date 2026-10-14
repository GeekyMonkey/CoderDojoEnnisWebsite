import { clubToday } from "#shared/utils/CalendarDates";
import { createError } from "h3";
import type { VerifiedMember } from "#server/utils/requestMember";
import type { MaintenanceData } from "#shared/types/MemberMaintenance";
import { memberFromRecords, memberFromRecord, type MemberRecord, type MemberModel } from "#shared/types/models/MemberModel";
import { memberParentFromRecords, type MemberParentRecord } from "#shared/types/models/MemberParentModel";
import { memberBadgeCategoryFromRecords, type MemberBadgeCategoryRecord } from "#shared/types/models/MemberBadgeCategoryModel";
import { memberAttendanceFromRecords, type MemberAttendanceRecord, type MemberAttendanceModel } from "#shared/types/models/MemberAttendanceModel";
import { teamFromRecords } from "#shared/types/models/TeamModel";
import { badgeCategoryFromRecords, type BadgeCategoryRecord } from "#shared/types/models/BadgeCategoryModel";
import type { TeamRecord } from "#server/db/TeamsData";

export type MaintenanceAction = "create" | "account" | "goals" | "password" | "link" | "unlink" | "skill" | "unskill";
const COLUMNS: Record<string, string> = {
	nameFirst: "name_first", nameLast: "name_last", email: "email", phone: "phone", githubLogin: "github_login", scratchName: "scratch_name", xboxGamertag: "xbox_gamertag",
	birthYear: "birth_year", fingerprintId: "fingerprint_id", nfcTag: "nfc_tag", login: "login", teamId: "team_id", registeredCurrentTerm: "registered_current_term",
	isNinja: "is_ninja", isParent: "is_parent", isMentor: "is_mentor", gardaVetted: "garda_vetted", goalShortTerm: "goal_short_term", goalLongTerm: "goal_long_term",
};

/** Map validated section fields to storage names without accepting arbitrary column input. */
export function storageFields(fields: object): Record<string, unknown> {
	const result: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(fields) as [string, unknown][]) {
		const column: string | null = COLUMNS[key] ?? null;
		if (!column) throw createError({ statusCode: 400, statusMessage: "Unknown member field" });
		result[column] = value;
	}
	return result;
}

/** Execute a mentor-only atomic maintenance operation with useful conflict responses. */
export async function maintainMember(actor: VerifiedMember, action: MaintenanceAction, id: string, fields: Record<string, unknown>, expected: Record<string, unknown> = {}): Promise<unknown> {
	const { data, error } = action === "create"
		? await actor.client.schema("coderdojo").rpc("signup_member", { p_actor: actor.id, p_id: id, p_fields: fields, p_attendance_date: fields.attendance_date ?? null })
		: await actor.client.schema("coderdojo").rpc("maintain_member", { p_actor: actor.id, p_action: action, p_id: id, p_fields: fields, p_expected: expected });
	if (error) {
		const status: number = error.code === "42501" ? 403 : error.code === "P0002" ? 404 : ["23505", "40001", "P0001"].includes(error.code) ? 409 : error.code === "22023" ? 400 : 503;
		throw createError({ statusCode: status, statusMessage: status === 503 ? "Unable to save member" : error.message });
	}
	return data ?? null;
}

/** Convert a successful member operation without returning stored credentials. */
export async function maintainMemberDetails(actor: VerifiedMember, action: MaintenanceAction, id: string, fields: Record<string, unknown>, expected: Record<string, unknown> = {}): Promise<MemberModel> {
	return memberFromRecord(await maintainMember(actor, action, id, fields, expected) as MemberRecord);
}

type RowQuery = ReturnType<ReturnType<ReturnType<VerifiedMember["client"]["schema"]>["from"]>["select"]>;
const PAGE_SIZE: number = 500;

/** Page through results so the API row limit never silently truncates directories or relationships. */
async function readRows<T>(query: () => RowQuery): Promise<T[]> {
 const rows: T[] = [];
 for (let offset: number = 0; ; offset += PAGE_SIZE) {
  const { data, error } = await query().range(offset, offset + PAGE_SIZE - 1);
  if (error || !data) throw createError({ statusCode: 503, statusMessage: "Unable to load maintenance data" });
  rows.push(...data as T[]);
  if (data.length < PAGE_SIZE) return rows;
 }
}

/** Load the shared maintenance directory and relationship/skill lookups for a verified mentor. */
export async function readMaintenance(actor: VerifiedMember): Promise<MaintenanceData> {
 const db: ReturnType<typeof actor.client.schema> = actor.client.schema("coderdojo");
 const [members, teams, categories, relationships, skills] = await Promise.all([
  readRows<MemberRecord>((): RowQuery => db.from("members").select("*").eq("deleted", false).order("name_first").order("name_last").order("id")),
  readRows<TeamRecord>((): RowQuery => db.from("teams").select("*").eq("deleted", false).order("team_name").order("id")),
  readRows<BadgeCategoryRecord>((): RowQuery => db.from("badge_categories").select("*").eq("deleted", false).order("category_name").order("id")),
  readRows<MemberParentRecord>((): RowQuery => db.from("member_parents").select("*").order("id")),
  readRows<MemberBadgeCategoryRecord>((): RowQuery => db.from("member_badge_categories").select("*").order("id")),
 ]);
 return { members: memberFromRecords(members), teams: teamFromRecords(teams), categories: badgeCategoryFromRecords(categories), relationships: memberParentFromRecords(relationships), skills: memberBadgeCategoryFromRecords(skills) };
}

/** Read only the selected active member's attendance history. */
export async function readMemberAttendance(actor: VerifiedMember, id: string): Promise<MemberAttendanceModel[]> {
	const { data: member, error: memberError } = await actor.client.schema("coderdojo").from("members").select("id").eq("id", id).eq("deleted", false).maybeSingle();
	if (memberError) throw createError({ statusCode: 503, statusMessage: "Unable to load member" });
	if (!member) throw createError({ statusCode: 404, statusMessage: "Member not found" });
 const rows: MemberAttendanceRecord[] = await readRows<MemberAttendanceRecord>((): RowQuery => actor.readClient.schema("coderdojo").from("member_attendances").select("*").lte("date", clubToday()).eq("member_id", id).order("date", { ascending: false }).order("id"));
 return memberAttendanceFromRecords(rows);
}
