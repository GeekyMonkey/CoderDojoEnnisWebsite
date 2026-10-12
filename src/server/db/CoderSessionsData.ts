import { createError } from "h3";
import type { VerifiedMember } from "#server/utils/requestMember";
import { coderSessionsSchema, coderSessionJoinedSchema, sessionHostSchema, safeSessionUrl, type CoderSession, type CoderSessionJoined, type SessionHost } from "#shared/types/CoderSession";
import type { Database } from "../../types/supabase";

type SessionRecord = Database["coderdojo"]["Tables"]["session_pods"]["Row"];
type HostRecord = Pick<Database["coderdojo"]["Tables"]["members"]["Row"], "id" | "name_first" | "name_last" | "has_photo" | "has_avatar" | "is_mentor" | "is_ninja" | "is_parent">;

/** Read upcoming non-mentor sessions and expose only safe URLs and public host imagery. */
export async function readCoderSessions(actor: VerifiedMember): Promise<CoderSession[]> {
 const now: Date = new Date();
 const today: string = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Dublin", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
 const { data, error } = await actor.readClient.schema("coderdojo").from("session_pods").select("*").eq("mentors_only", false).eq("deleted", false)
  .or(`ends_at.gt.${now.toISOString()},and(ends_at.is.null,session_date.gte.${today})`).order("topic").order("id");
 if (error) throw createError({ statusCode: 503, statusMessage: "Unable to load sessions" });
 const sessions: SessionRecord[] = data ?? [];
 const hostIds: string[] = [...new Set(sessions.flatMap((session: SessionRecord): string[] => [session.host_id, session.host2_id].filter((id: string | null): id is string => id !== null)))];
 const hosts: Map<string, SessionHost> = await readSessionHosts(actor, hostIds);
 return sessionCards(sessions, hosts);
}

/** Validate the URL before a locked join transaction records only today's own attendance. */
export async function joinOwnSession(actor: VerifiedMember, sessionId: string): Promise<CoderSessionJoined> {
 const { data: session, error: sessionError } = await actor.readClient.schema("coderdojo").from("session_pods").select("url").eq("id", sessionId).maybeSingle();
 if (sessionError) throw createError({ statusCode: 503, statusMessage: "Unable to load session" });
 if (!session) throw createError({ statusCode: 404, statusMessage: "Session unavailable" });
 const url: string | null = safeSessionUrl(session.url);
 if (url === null) throw createError({ statusCode: 400, statusMessage: "Session has no valid joining URL" });
 const { data, error } = await actor.client.schema("coderdojo").rpc("join_member_session", { p_actor: actor.id, p_session: sessionId, p_expected_url: url });
 if (error) throw createError({ statusCode: error.code === "42501" ? 403 : error.code === "P0002" ? 404 : error.code === "P0001" ? 409 : error.code === "22023" ? 400 : 503, statusMessage: ["42501", "P0002", "P0001", "22023"].includes(error.code) ? error.message : "Unable to join session" });
 return coderSessionJoinedSchema.parse(data);
}


/** Read public host presentation fields, restricting the full host directory to mentors. */
export async function readSessionHosts(actor: VerifiedMember, hostIds: string[] | null): Promise<Map<string, SessionHost>> {
 if (hostIds === null && !actor.member.isMentor) throw createError({ statusCode: 403, statusMessage: "Mentor access required" });
 const hosts: Map<string, SessionHost> = new Map();
 if (hostIds === null || hostIds.length) {
  const { data: hostRows, error: hostError } = hostIds === null
   ? await actor.client.schema("coderdojo").from("members").select("id,name_first,name_last,has_photo,has_avatar,is_mentor,is_ninja,is_parent").eq("deleted", false).eq("is_mentor", true)
   : await actor.client.schema("coderdojo").from("members").select("id,name_first,name_last,has_photo,has_avatar,is_mentor,is_ninja,is_parent").eq("deleted", false).eq("is_mentor", true).in("id", hostIds);
  if (hostError) throw createError({ statusCode: 503, statusMessage: "Unable to load session hosts" });
  for (const row of hostRows ?? []) {
   const host: HostRecord = row;
   hosts.set(host.id, sessionHostSchema.parse({ id: host.id, nameFirst: host.name_first, nameLast: host.name_last, hasPhoto: host.has_photo, hasAvatar: host.has_avatar, isMentor: host.is_mentor, isNinja: host.is_ninja, isParent: host.is_parent }));
  }
 }
 return hosts;
}

/** Convert schedule rows into the shared, safe session card contract. */
export function sessionCards(sessions: SessionRecord[], hosts: Map<string, SessionHost>): CoderSession[] {
 return coderSessionsSchema.parse(sessions.map((session: SessionRecord): CoderSession => ({
  id: session.id, topic: session.topic, sessionDate: session.session_date, endsAt: session.ends_at === null ? null : Date.parse(session.ends_at), url: safeSessionUrl(session.url),
  hosts: [...new Set([session.host_id, session.host2_id])].flatMap((id: string | null): SessionHost[] => id !== null && hosts.has(id) ? [hosts.get(id)!] : []),
 })));
}
