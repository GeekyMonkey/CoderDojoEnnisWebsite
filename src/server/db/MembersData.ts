import type { EventHandlerRequest, H3Event } from "h3";
import {
	type MemberModel,
	type MemberModelArray,
	MemberModelArraySchema,
	memberFromRecords,
	memberToRecords,
} from "~~/shared/types/models/MemberModel";
import { ErrorToString } from "~~/shared/utils/ErrorHelpers";
import type { Database } from "../../types/supabase";
import { GeneratePasswordHash } from "../utils/authUtils";
import { GetSupabaseAdminClient } from "./DatabaseClient";

export type MemberRecord = Database["coderdojo"]["Tables"]["members"]["Row"];

export const MembersData = {
	/**
	 * Get all members
	 */
	GetMembers: async (
		event: H3Event<EventHandlerRequest>,
	): Promise<MemberModel[]> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) {
			return [];
		}
		try {
			const { data, error } = await supabase
				.schema("coderdojo")
				.from("members")
				.select("*");
			if (error || !data || data.length === 0) {
				console.error("Error fetching members:", error);
				return [];
			}
			return memberFromRecords(data as any);
		} catch (error) {
			throw new Error(`Error fetching members: ${ErrorToString(error)}`);
		}
	},

	/**
	 * Get one member by ID
	 */
	GetMemberById: async (
		event: H3Event<EventHandlerRequest>,
		memberId: string,
	): Promise<MemberModel | null> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) {
			return null;
		}

		try {
			const { data, error } = await supabase
				.schema("coderdojo")
				.from("members")
				.select("*")
				.eq("id", memberId)
				.single();
			if (error || !data) {
				console.error("Error fetching member by ID:", error);
				return null;
			}
			return memberFromRecords([data])[0];
		} catch (error) {
			throw new Error(`Error fetching member by ID: ${ErrorToString(error)}`);
		}
	},

	/**
	 * Get one member by fingerprint ID
	 */
	GetMemberByFingerprintId: async (
		event: H3Event<EventHandlerRequest>,
		fingerprintId: number,
	): Promise<MemberModel | null> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) {
			return null;
		}

		try {
			const { data, error } = await supabase
				.schema("coderdojo")
				.from("members")
				.select("*")
				.eq("fingerprint_id", fingerprintId)
				.single();
			if (error || !data) {
				console.error("Error fetching member by fingerprint ID:", error);
				return null;
			}
			return memberFromRecords([data])[0];
		} catch (error) {
			throw new Error(
				`Error fetching member by fingerprint ID: ${ErrorToString(error)}`,
			);
		}
	},

	/**
	 * Get active members by login username (or email)
	 */
	GetMembersByLoginUsername: async (
		event: H3Event<EventHandlerRequest>,
		usernameLower: string,
	): Promise<MemberRecord[]> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) {
			return [];
		}
		const candidates: MemberRecord[] = [];

		try {
			const { data: byLoginEmail } = await supabase
				.schema("coderdojo")
				.from("members")
				.select("*")
				.or(`login.eq.${usernameLower},email.eq.${usernameLower}`)
				.eq("deleted", false);
			if (byLoginEmail) {
				candidates.push(...(byLoginEmail as MemberRecord[]));
			}
		} catch (error) {
			throw new Error(
				`Error fetching members by login username: ${ErrorToString(error)}`,
			);
		}
		return candidates;
	},

	/**
	 * Get active members by login first and last name
	 */
	GetMembersByLoginFirstLast: async (
		event: H3Event<EventHandlerRequest>,
		first: string,
		last: string,
	): Promise<MemberRecord[]> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) {
			return [];
		}
		const candidates: MemberRecord[] = [];

		try {
			const { data: byLoginEmail } = await supabase
				.schema("coderdojo")
				.from("members")
				.select("*")
				.ilike("name_first", first)
				.ilike("name_last", last)
				.eq("deleted", false);
			if (byLoginEmail) {
				candidates.push(...(byLoginEmail as MemberRecord[]));
			}
		} catch (error) {
			throw new Error(
				`Error fetching members by login first and last name: ${ErrorToString(error)}`,
			);
		}
		return candidates;
	},

	/**
	 * Save changes to a member
	 */
	SaveMember: async (
		event: H3Event<EventHandlerRequest>,
		member: MemberModel,
	): Promise<MemberModel | null> => {
		const all = await MembersData.SaveMembers(event, [member]);
		return all[0] || null;
	},

	/**
	 * Save multiple members
	 */
	SaveMembers: async (
		event: H3Event<EventHandlerRequest>,
		members: MemberModelArray,
	): Promise<MemberModel[]> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) {
			return [];
		}
		try {
			// Use zod validation on model before saving (Excludes password_hash)
			const {
				success,
				error: validationError,
				data: validMembers,
			} = MemberModelArraySchema.safeParse(members);
			if (!success) {
				console.error("Validation error:", validationError);
				return [];
			}
			const { data, error } = await supabase
				.schema("coderdojo")
				.from("members")
				.upsert(memberToRecords(validMembers) as any, { onConflict: "id" })
				.select();
			if (error || !data || data.length === 0) {
				console.error("Error saving members:", error);
				return [];
			}
			return memberFromRecords(data as any);
		} catch (error) {
			throw new Error(`Error saving members: ${ErrorToString(error)}`);
		}
	},

	/**
	 * Delete a member by ID
	 */
	DeleteMember: async (
		event: H3Event<EventHandlerRequest>,
		memberId: string,
	): Promise<boolean> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) {
			return false;
		}
		try {
			const { error } = await supabase
				.schema("coderdojo")
				.from("members")
				.delete()
				.eq("id", memberId);
			if (error) {
				console.error("Error deleting member:", error);
				return false;
			}
			return true;
		} catch (error) {
			console.error(`Error deleting member: ${ErrorToString(error)}`);
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
		// saltOverride?: string,
	): Promise<boolean> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) {
			return false;
		}
		try {
			//const salt = saltOverride || process.env.PASSWORD_SALT || "_Salty!_";
			const runtime = useRuntimeConfig();
			const salt = runtime.private.auth.pass_salt;
			const hash = await GeneratePasswordHash(plainPassword, salt);
			if (!hash) {
				return false;
			}
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
	 * Rule (revised): Generate a deterministic password for any non-deleted member.
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
		if (!supabase) {
			return { updated: 0, skipped: 0, errors: 0 };
		}
		// const salt = options?.saltOverride || process.env.PASSWORD_SALT || "_Salty!_";
		const runtime = useRuntimeConfig();
		const salt = runtime.private.auth.pass_salt;
		let updated = 0,
			skipped = 0,
			errors = 0;

		for (const m of legacyMembers) {
			const shouldGenerate = m.isMentor && !m.deleted;
			if (!shouldGenerate) {
				skipped++;
				continue;
			}
			const firstInitial = (m.nameFirst || "").trim().substring(0, 1);
			const last = (m.nameLast || "").trim();
			const shortId = m.id ? m.id.substring(0, 8) : "";
			const plain = (firstInitial + last + shortId).toLowerCase().trim();
			if (!plain) {
				skipped++;
				continue;
			}
			try {
				const hash = await GeneratePasswordHash(plain, salt);
				if (!hash) {
					errors++;
					continue;
				}
				// Skip if not forcing and a hash already exists
				if (!options?.force) {
					const { data: existing } = await supabase
						.schema("coderdojo")
						.from("members")
						.select("password_hash")
						.eq("id", m.id)
						.single();
					if (existing?.password_hash) {
						skipped++;
						continue;
					}
				}
				const { error } = await supabase
					.schema("coderdojo")
					.from("members")
					.update({ password_hash: hash })
					.eq("id", m.id);
				if (error) {
					errors++;
					continue;
				}
				updated++;
			} catch (e) {
				errors++;
			}
		}
		return { updated, skipped, errors };
	},
};
