import type { H3Event, EventHandlerRequest } from "h3";
import { GetSupabaseAdminClient } from "./DatabaseClient";
import type { Database } from "../../types/supabase";
import { memberFromRecords, memberToRecords, type MemberModel } from "~~/shared/types/models/MemberModel";
import { GeneratePasswordHash } from "../utils/authUtils";

export type MemberRecord = Database["coderdojo"]["Tables"]["members"]["Row"];

export const MembersData = {
	GetMembers: async (
		event: H3Event<EventHandlerRequest>,
	): Promise<MemberModel[]> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) return [];
		try {
			const { data, error } = await supabase.schema("coderdojo").from("members").select("*");
			if (error || !data || data.length === 0) {
				console.error("Error fetching members:", error);
				return [];
			}
			return memberFromRecords(data as any);
		} catch (error: any) {
			throw new Error(`Error fetching members: ${error?.message}`);
		}
	},
	SaveMember: async (
		event: H3Event<EventHandlerRequest>,
		member: MemberModel
	): Promise<MemberModel | null> => {
		const all = await MembersData.SaveMembers(event, [member]);
		return all[0] || null;
	},
	SaveMembers: async (
		event: H3Event<EventHandlerRequest>,
		members: MemberModel[]
	): Promise<MemberModel[]> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) return [];
		try {
			const { data, error } = await supabase.schema("coderdojo").from("members").upsert(memberToRecords(members) as any, { onConflict: "id" }).select();
			if (error || !data || data.length === 0) {
				console.error("Error saving members:", error);
				return [];
			}
			return memberFromRecords(data as any);
		} catch (error: any) {
			throw new Error(`Error saving members: ${error?.message}`);
		}
	},
	DeleteMember: async (
		event: H3Event<EventHandlerRequest>,
		memberId: string
	): Promise<boolean> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) return false;
		try {
			const { error } = await supabase.schema("coderdojo").from("members").delete().eq("id", memberId);
			if (error) {
				console.error("Error deleting member:", error);
				return false;
			}
			return true;
		} catch (error: any) {
			console.error(`Error deleting member: ${error?.message}`);
			return false;
		}
	},

	/**
	 * Set (or reset) a member password hash without exposing it via MemberModel
	 */
	SetMemberPasswordHash: async (
		event: H3Event<EventHandlerRequest>,
		memberId: string,
		plainPassword: string,
		saltOverride?: string,
	): Promise<boolean> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) return false;
		try {
			const salt = saltOverride || process.env.PASSWORD_SALT || "_Salty!_";
			const hash = await GeneratePasswordHash(plainPassword, salt);
			if (!hash) return false;
			const { error } = await supabase
				.schema("coderdojo")
				.from("members")
				.update({ password_hash: hash })
				.eq("id", memberId);
			if (error) {
				console.error("Error setting member password hash:", error);
				return false;
			}
			return true;
		} catch (err) {
			console.error("SetMemberPasswordHash error", err);
			return false;
		}
	},

	/**
	 * Bulk deterministic legacy password migration.
	 * Rule (revised): Generate a deterministic password for any non-deleted mentor (fingerprint no longer required).
	 * Seed pattern (lowercased, trimmed): firstInitial + lastName + shortId
	 * Where shortId = first 8 chars of UUID (fallback to full if cannot slice).
	 * Skips existing hashes unless force = true.
	 */
	BulkMigrateLegacyPasswords: async (
		event: H3Event<EventHandlerRequest>,
		legacyMembers: Array<{
			id: string;
			nameFirst?: string | null;
			nameLast?: string | null;
			fingerprintId?: number | null;
			isMentor?: boolean;
			deleted?: boolean;
		}>,
		options?: { force?: boolean; saltOverride?: string },
	): Promise<{ updated: number; skipped: number; errors: number }> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) return { updated: 0, skipped: 0, errors: 0 };
		const salt = options?.saltOverride || process.env.PASSWORD_SALT || "_Salty!_";
		let updated = 0, skipped = 0, errors = 0;

		for (const m of legacyMembers) {
			const shouldGenerate = m.isMentor && !m.deleted; // fingerprint no longer required
			if (!shouldGenerate) { skipped++; continue; }
			const firstInitial = (m.nameFirst || "").trim().substring(0, 1);
			const last = (m.nameLast || "").trim();
			const shortId = m.id ? m.id.substring(0,8) : "";
			const plain = (firstInitial + last + shortId).toLowerCase().trim();
			if (!plain) { skipped++; continue; }
			try {
				const hash = await GeneratePasswordHash(plain, salt);
				if (!hash) { errors++; continue; }
				// Skip if not forcing and a hash already exists
				if (!options?.force) {
					const { data: existing } = await supabase
						.schema("coderdojo")
						.from("members")
						.select("password_hash")
						.eq("id", m.id)
						.single();
					if (existing && existing.password_hash) { skipped++; continue; }
				}
				const { error } = await supabase
					.schema("coderdojo")
					.from("members")
					.update({ password_hash: hash })
					.eq("id", m.id);
				if (error) { errors++; continue; }
				updated++;
			} catch (e) {
				errors++;
			}
		}
		return { updated, skipped, errors };
	},
};
