import { createError, defineEventHandler, getQuery, setResponseHeader, type H3Event } from "h3";
import { requireRequestMentor } from "#server/utils/requestMentor";
import { ReportQuerySchema, ReportRowSchema, defaultReportSince, type ReportRow } from "#shared/types/MentorReport";
import { beltFromRecord, type BeltRecord } from "#shared/types/models/BeltModel";
import type { MemberBeltRecord } from "#shared/types/models/MemberBeltModel";
import type { VerifiedMember } from "#server/utils/requestMember";

type ReportMember = { id: string; name_first: string | null; name_last: string | null; email: string | null; has_photo: boolean; registered_current_term: boolean };
/** Return only report fields after verifying the current mentor role. */
export default defineEventHandler(async (event: H3Event): Promise<ReportRow[]> => {
 const actor: VerifiedMember = await requireRequestMentor(event);
 setResponseHeader(event, "Cache-Control", "private, no-store");
 const parsed: ReturnType<typeof ReportQuerySchema.safeParse> = ReportQuerySchema.safeParse(getQuery(event));
 if (!parsed.success || (parsed.data.kind !== "belts" && parsed.data.since)) throw createError({ statusCode: 400, statusMessage: "Invalid report filters" });
 const db: ReturnType<typeof actor.client.schema> = actor.client.schema("coderdojo");
 const kind: string = parsed.data.kind;
 const { data: memberData, error: memberError } = kind === "belts"
  ? await db.from("members").select("id,name_first,name_last,email,has_photo,registered_current_term").eq("deleted", false).order("name_first").order("name_last").order("id")
  : await db.from("members").select("id,name_first,name_last,email,has_photo,registered_current_term").eq("deleted", false).eq(kind === "parents" ? "is_parent" : "is_mentor", true).not("email", "is", null).neq("email", "").order("name_first").order("name_last").order("id");
 if (memberError || !memberData) throw createError({ statusCode: 503, statusMessage: "Unable to load report" });
 const members: ReportMember[] = memberData as ReportMember[];
 const byId: Map<string, ReportMember> = new Map(members.map((member: ReportMember): [string, ReportMember] => [member.id, member]));
 /** Map names and display fields without returning credentials or private profile fields. */
 function row(member: ReportMember): ReportRow {
  return { id: member.id, memberId: member.id, nameFirst: member.name_first ?? "", nameLast: member.name_last ?? "", email: kind === "belts" ? "" : member.email ?? "", hasPhoto: member.has_photo, registeredCurrentTerm: member.registered_current_term, awarded: null, notes: "", belt: null };
 }
 if (kind !== "belts") return ReportRowSchema.array().parse(members.filter((member: ReportMember): boolean => Boolean(member.email?.trim())).map(row));
 const since: string = parsed.data.since ?? defaultReportSince();
 const [awardResult, beltResult] = await Promise.all([
  db.from("member_belts").select("*").gte("awarded", since).order("awarded", { ascending: false }).order("id"),
  db.from("belts").select("*").order("id"),
 ]);
 if (awardResult.error || beltResult.error || !awardResult.data || !beltResult.data) throw createError({ statusCode: 503, statusMessage: "Unable to load report" });
 const awards: MemberBeltRecord[] = awardResult.data as MemberBeltRecord[];
 const belts: BeltRecord[] = beltResult.data as BeltRecord[];
 const beltById: Map<string, BeltRecord> = new Map(belts.map((belt: BeltRecord): [string, BeltRecord] => [belt.id, belt]));
 const rows: ReportRow[] = [];
 for (const award of awards) {
  const member: ReportMember | undefined = byId.get(award.member_id ?? "");
  const belt: BeltRecord | undefined = beltById.get(award.belt_id ?? "");
  if (member && belt) rows.push({ ...row(member), id: award.id, awarded: award.awarded, notes: award.awarded_notes ?? "", belt: beltFromRecord(belt) });
 }
 return ReportRowSchema.array().parse(rows);
});
