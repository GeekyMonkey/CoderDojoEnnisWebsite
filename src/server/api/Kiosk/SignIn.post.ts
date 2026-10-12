import { createError, defineEventHandler, readBody, setResponseHeader, type H3Event } from "h3";
import { z } from "zod";
import { requireKiosk, requireKioskOrigin } from "#server/utils/kioskCookie";
import { AuthService } from "#server/services/AuthService";
import { AttendanceService } from "#server/services/AttendanceService";
import { MembersData } from "#server/db/MembersData";
import type { MemberModel } from "#shared/types/models/MemberModel";
import type { AttendanceSignInResponseModel } from "#shared/types/AttendanceModels";
import type { ApiResponse } from "#shared/types/ApiResponse";
import { GetSupabaseAdminClient } from "#server/db/DatabaseClient";
import { beltFromRecord, type BeltRecord, type BeltModel } from "#shared/types/models/BeltModel";
import type { KioskSignInResponse } from "#shared/types/Kiosk";
import { loginRequestSchema } from "#shared/validation/AuthSchemas";

const requestSchema = z.discriminatedUnion("kind", [
 loginRequestSchema.extend({ kind: z.literal("password") }),
 z.object({ kind: z.literal("guid"), memberGuid: z.string().trim().regex(/^(?:[0-9a-f]{32}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i).transform((value: string): string => value.length === 32 ? value.replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, "$1-$2-$3-$4-$5") : value) }),
 z.object({ kind: z.literal("nfc"), nfcTag: z.string().trim().min(1).max(120) }),
]);

/** Record today's attendance through the bounded kiosk capability. */
export default defineEventHandler(async (event: H3Event): Promise<ApiResponse<KioskSignInResponse>> => {
 requireKioskOrigin(event); await requireKiosk(event);
 setResponseHeader(event, "Cache-Control", "no-store");
 const parsed: ReturnType<typeof requestSchema.safeParse> = requestSchema.safeParse(await readBody(event));
 if (!parsed.success) throw createError({ statusCode: 400, statusMessage: "Invalid sign-in request" });
 const request: z.infer<typeof requestSchema> = parsed.data;
 try {
  const member: MemberModel | null = request.kind === "password"
   ? (await new AuthService(event).validateCredentials(request.username, request.password)).member
   : request.kind === "guid" ? await MembersData.GetMemberById(event, request.memberGuid)
   : await MembersData.GetMemberByNfcTag(event, request.nfcTag);
  if (!member || member.deleted || !(member.isNinja || member.isMentor || member.isParent)) throw new Error("Member unavailable");
  const response: AttendanceSignInResponseModel = await new AttendanceService(event).signInMember(member);
  // Keep the existing display shape while withholding contact, login and scanner data.
  const safeMember: MemberModel = { ...response.memberDetails, birthYear: null, email: null, fingerprintId: null, nfcTag: null, gardaVetted: false, githubLogin: null, goalLongTerm: null, goalShortTerm: null, login: null, phone: null, scratchName: null, xboxGamertag: null };
  const client: Awaited<ReturnType<typeof GetSupabaseAdminClient>> = await GetSupabaseAdminClient(event);
  if (!client) throw new Error("Database unavailable");
  const { data: team, error: teamError } = response.memberDetails.teamId
   ? await client.schema("coderdojo").from("teams").select("team_name").eq("id", response.memberDetails.teamId).eq("deleted", false).maybeSingle()
   : { data: null, error: null };
  const { data: awarded, error: beltError } = await client.schema("coderdojo").from("member_belts")
   .select("belt:belts(id,deleted,color,hex_code,description,sort_order)")
   .eq("member_id", member.id).not("awarded", "is", null).order("awarded", { ascending: false }).limit(1).maybeSingle();
  if (teamError || beltError) throw new Error("Display unavailable");
  const beltRecord: BeltRecord | null = (awarded as unknown as { belt: BeltRecord | null } | null)?.belt ?? null;
  const belt: BeltModel | null = beltRecord ? beltFromRecord(beltRecord) : null;
  return { success: true, data: { ...response, memberDetails: safeMember, teamName: team?.team_name ?? null, belt, logs: [] }, logs: [] };
 } catch { return { success: false, error: "Unable to sign in", logs: [] }; }
});
