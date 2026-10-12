import { createError } from "h3";
import type { VerifiedMember } from "#server/utils/requestMember";
import { applicationResultSchema } from "#shared/types/Coder";
import { managedSessionSchema, sessionManagementSchema, type ManagedSession, type SessionManagement, type SessionFields, type SessionSnapshot } from "#shared/types/SessionMaintenance";
import type { SessionHost, CoderSession } from "#shared/types/CoderSession";
import { readSessionHosts, sessionCards } from "./CoderSessionsData";
import type { Database } from "../../types/supabase";

type PodRecord = Database["coderdojo"]["Tables"]["session_pods"]["Row"];

/** Assemble safe card data and an exact stored-field snapshot for conflict detection. */
function managedPod(row: PodRecord, card: CoderSession): ManagedSession {
 return managedSessionSchema.parse({ ...card, fields: { topic: row.topic, url: row.url, hostId: row.host_id, host2Id: row.host2_id, mentorsOnly: row.mentors_only, sessionDate: row.session_date, endsAt: row.ends_at === null ? null : Date.parse(row.ends_at) } });
}

/** List non-archived pods and only the public presentation fields of eligible mentor hosts. */
export async function readSessionManagement(actor: VerifiedMember): Promise<SessionManagement> {
 const { data, error } = await actor.client.schema("coderdojo").from("session_pods").select("*").eq("deleted", false).order("mentors_only").order("topic").order("id");
 if (error) throw createError({ statusCode: 503, statusMessage: "Unable to load pods" });
 const rows: PodRecord[] = data ?? [];
 const hosts: Map<string, SessionHost> = await readSessionHosts(actor, null);
 const cards: Map<string, CoderSession> = new Map(sessionCards(rows, hosts).map((card: CoderSession): [string, CoderSession] => [card.id, card]));
 return sessionManagementSchema.parse({ actorId: actor.id, hosts: [...hosts.values()].sort((left: SessionHost, right: SessionHost): number => `${left.nameFirst} ${left.nameLast}`.localeCompare(`${right.nameFirst} ${right.nameLast}`)), pods: rows.map((row: PodRecord): ManagedSession => managedPod(row, cards.get(row.id)!)) });
}

/** Execute guarded mentor pod lifecycle changes through a service-only database transaction. */
export async function maintainSessionPod(actor: VerifiedMember, action: "create" | "update" | "delete", id: string | null, fields: SessionFields | null, expected: SessionSnapshot | null): Promise<ManagedSession | null> {
 const { data, error } = await actor.client.schema("coderdojo").rpc("maintain_session_pod", { p_actor: actor.id, p_action: action, ...(id === null ? {} : { p_id: id }), p_fields: fields ?? {}, p_expected: expected ?? {} });
 if (error) throw createError({ statusCode: error.code === "42501" ? 403 : error.code === "P0002" ? 404 : error.code === "P0001" ? 409 : error.code === "22023" ? 400 : 503, statusMessage: ["42501", "P0002", "P0001", "22023"].includes(error.code) ? error.message : "Unable to save pod" });
 const result: { id: string } = applicationResultSchema.parse(data);
 if (action === "delete") return null;
 const management: SessionManagement = await readSessionManagement(actor);
 return management.pods.find((pod: ManagedSession): boolean => pod.id === result.id) ?? null;
}
