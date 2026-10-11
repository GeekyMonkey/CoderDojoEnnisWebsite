import { createError } from "h3";
import type { VerifiedMember } from "#server/utils/requestMember";
import { teamFromRecord, teamFromRecords, type TeamModel } from "#shared/types/models/TeamModel";
import type { TeamFields } from "#shared/types/TeamMaintenance";
import type { TeamRecord } from "./TeamsData";
export type TeamAction = "create" | "update" | "delete";
/** Convert only the allowed editable fields into database columns. */
function storageFields(fields: TeamFields): Record<string, unknown> { return { team_name: fields.teamName, goal: fields.goal, notes: fields.notes, hexcode: fields.hexcode }; }
/** Read all active teams with deterministic paging. */
export async function readTeams(actor: VerifiedMember): Promise<TeamModel[]> {
 const rows: TeamRecord[] = [];
 for (let offset: number = 0; ; offset += 500) {
  const { data, error } = await actor.client.schema("coderdojo").from("teams").select("*").eq("deleted", false).order("team_name").order("id").range(offset, offset + 499);
  if (error || !data) throw createError({ statusCode: 503, statusMessage: "Unable to load teams" });
  rows.push(...data as TeamRecord[]);
  if (data.length < 500) return teamFromRecords(rows);
 }
}
/** Save or soft-delete a team atomically after checking its snapshot and current mentor role. */
export async function maintainTeam(actor: VerifiedMember, action: TeamAction, id: string, fields: TeamFields | null, expected: TeamFields | null): Promise<TeamModel> {
 const { data, error } = await actor.client.schema("coderdojo").rpc("maintain_team", { p_actor: actor.id, p_action: action, p_id: id, p_fields: fields ? storageFields(fields) : {}, p_expected: expected ? storageFields(expected) : {} });
 if (error) {
  const status: number = error.code === "42501" ? 403 : error.code === "P0002" ? 404 : ["P0001", "23505"].includes(error.code) ? 409 : error.code === "22023" ? 400 : 503;
  throw createError({ statusCode: status, statusMessage: status === 503 ? "Unable to save team" : error.message });
 }
 return teamFromRecord(data as TeamRecord);
}
