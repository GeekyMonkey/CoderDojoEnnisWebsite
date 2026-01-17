import type { SupabaseClient } from "@supabase/supabase-js";
import type { EventHandlerRequest, H3Event } from "h3";
import { defineEventHandler } from "#imports";
import { BadgeCategoriesData } from "~~/server/db/BadgeCategoriesData";
import { BadgesData } from "~~/server/db/BadgesData";
import { BeltsData } from "~~/server/db/BeltsData";
import { GetBucketBaseUrl, GetBucketFolder, GetSupabaseAdminClient } from "~~/server/db/DatabaseClient";
import { MembersData } from "~~/server/db/MembersData";
import { TeamsData } from "~~/server/db/TeamsData";
import {
	ReadLegacyAdultAttendances,
	ReadLegacyAdultBadgeCategories,
	ReadLegacyAdults,
	ReadLegacyBadgeCategories,
	ReadLegacyBadges,
	ReadLegacyBelts,
	ReadLegacyMemberAttendances,
	ReadLegacyMemberBadges,
	ReadLegacyMemberBelts,
	ReadLegacyMemberParents,
	ReadLegacyNinjas,
	ReadLegacyTeams,
} from "~~/server/sql/LegacyData";
import { FromLegacyAdultAttendanceEntities } from "~~/server/sql/Models/LegacyAdultAttendanceEntity";
import { FromLegacyAdultBadgeCategoryEntities } from "~~/server/sql/Models/LegacyAdultBadgeCategoryEntity";
import { FromLegacyAdultEntities } from "~~/server/sql/Models/LegacyAdultEntity";
import { FromLegacyBadgeCategoryEntities } from "~~/server/sql/Models/LegacyBadgeCategoryEntity";
import { FromLegacyBadgeEntities } from "~~/server/sql/Models/LegacyBadgeEntity";
import { FromLegacyBeltEntities } from "~~/server/sql/Models/LegacyBeltEntity";
import { FromLegacyMemberAttendanceEntities } from "~~/server/sql/Models/LegacyMemberAttendanceEntity";
import { FromLegacyMemberBadgeEntities } from "~~/server/sql/Models/LegacyMemberBadgeEntity";
import { FromLegacyMemberBeltEntities } from "~~/server/sql/Models/LegacyMemberBeltEntity";
import { FromLegacyMemberEntities } from "~~/server/sql/Models/LegacyMemberEntity";
import { FromLegacyMemberParentEntities } from "~~/server/sql/Models/LegacyMemberParentEntity";
import { FromLegacyTeamEntities } from "~~/server/sql/Models/LegacyTeamEntity";
import { memberFromRecords, MemberModel } from "~~/shared/types/models/MemberModel";
import { ErrorToString } from "~~/shared/utils/ErrorHelpers";
import { FormatBucketFileName } from "~~/shared/types/Supabase";

// Global tolerance constants
const TIME_TOLERANCE_MS = 6 * 60 * 60 * 1000; // 6 hours tolerance for loginDate comparisons

const log = useLogger("CopyDataAPI");

type ResponseBody = {
	logs: string[];
	success: boolean;
};

/**
 * POST: api/Legacy/CopyData
 */
export default defineEventHandler(async (event): Promise<ResponseBody> => {
	// Access request body
	// const body: RequestBody = await readBody(event);
	const resp: ResponseBody = {
		logs: [],
		success: false,
	};

	resp.logs.push(...(await CopyData(event)));
	resp.logs.push(...(await FindMemberImages(event)));

	return {
		...resp,
		success: !resp.logs.find((e) => e.toLowerCase().startsWith("error")),
	};
});

/**
 * Find member images in storage and tag the members accordingly
 */
async function FindMemberImages(
	event: H3Event<EventHandlerRequest>,
): Promise<string[]> {
	const logs: string[] = [];

	try {
		const bucketUrl = await GetBucketBaseUrl({ event });
		logs.push(`Bucket base URL: ${bucketUrl}`);

		const { files: avatars, error: avatarsError } = await GetBucketFolder({ event, folderPath: "Members/Avatars" });
		if (avatarsError) {
			logs.push(`Error finding avatar files: ${avatarsError}`);
			return logs;
		}
		logs.push(`Found ${avatars ? avatars.length : 0} avatar files in storage`);
		// logs.push(`Avatars: ${JSON.stringify(avatars.map((f) => f.name))}...`);

		const { files: photos, error: photosError } = await GetBucketFolder({ event, folderPath: "Members/Photos" });
		if (photosError) {
			logs.push(`Error finding photo files: ${photosError}`);
			return logs;
		}
		logs.push(`Found ${photos ? photos.length : 0} photo files in storage`);

		// Load the members
		const members: MemberModel[] = await MembersData.GetMembers(event, true);
		logs.push(`Loaded ${members.length} members from database`);
		
		// Check each member for avatar/photo presence
		const changedMembers: MemberModel[] = [];
		let membersWithPhotoCount = 0;
		for (const member of members) {
			const fileName: string = FormatBucketFileName("Member", member.id, "jpg");
			const hasAvatar: boolean = avatars.find((f) => f.name === fileName) !== undefined;
			const hasPhoto: boolean = photos.find((f) => f.name === fileName) !== undefined;
			if (member.hasAvatar !== hasAvatar || member.hasPhoto !== hasPhoto) {
				member.hasAvatar = hasAvatar;
				member.hasPhoto = hasPhoto;
				changedMembers.push(member);
			}
			if (member.hasPhoto || member.hasAvatar) {
				membersWithPhotoCount++;
			}
		}
		logs.push(`Members with changed image flags: ${changedMembers.length}`);
		logs.push(`Members with photo: ${membersWithPhotoCount}`);
		if (changedMembers.length > 0) {
			await MembersData.SaveMembers(event, changedMembers);
		}

	} catch (error) {
		logs.push(`Error processing member images: ${ErrorToString(error)}`);
	}

	return logs;
}

/**
 * Copy the SQL Server data to Supabase
 */
async function CopyData(
	event: H3Event<EventHandlerRequest>,
): Promise<string[]> {
	const logs: string[] = [];
	
	try {
		// Get a DB connection
		const db: SupabaseClient | null = await GetSupabaseAdminClient(event);
		if (!db) {
			log.error("Failed to initialize Supabase client");
			return [];
		}
		logs.push("DB client created");

		// Copy the data (order matters)
		logs.push(...(await CopyTeamsTable(event, db)));
		logs.push(...(await CopyBadgeCategoriesTable(event, db)));
		logs.push(...(await CopyBadgesTable(event, db)));
		logs.push(...(await CopyBeltsTable(event, db)));
		logs.push(...(await CopyMembersTable(event, db)));
		logs.push(...(await CopySessionsTable(event, db)));
		logs.push(...(await CopyAttendanceTable(event, db)));
		logs.push(...(await CopyMemberBadgeCategoriesTable(event, db)));
		logs.push(...(await CopyMemberParentsTable(event, db)));
		logs.push(...(await CopyMemberBadgesTable(event, db)));
		logs.push(...(await CopyMemberBeltsTable(event, db)));
	} catch (error) {
		log.error("Error copying data:", undefined, error);
		logs.push(`Error: ${ErrorToString(error)}`);
	}
	return logs;
}

/**
 * Copy the teams table
 */
async function CopyTeamsTable(
	event: H3Event<EventHandlerRequest>,
	db: SupabaseClient,
): Promise<string[]> {
	const logs: string[] = [];

	const { error } = await db
		.schema("coderdojo")
		.from("teams")
		.delete()
		.not("id", "is", null);
	if (error) {
		logs.push(`Error deleting teams: ${error.message}`);
	} else {
		logs.push("Teams deleted successfully");
	}

	logs.push("Reading teams");
	const legacyTeams = await ReadLegacyTeams();

	logs.push(`Copying teams table with ${legacyTeams.length} rows`);
	const newTeams = FromLegacyTeamEntities(legacyTeams);

	try {
		await TeamsData.SaveTeams(event, newTeams);
		logs.push(`Inserted teams`);

		// Verification: re-read teams and compare (case-insensitive UUIDs)
		const savedTeams = await TeamsData.GetTeams(event, true);

		// Build lookup maps using lowercase UUID keys so case differences don't cause false negatives
		const sourceById = new Map(newTeams.map((t) => [t.id.toLowerCase(), t]));
		const savedById = new Map(savedTeams.map((t) => [t.id.toLowerCase(), t]));

		const missingInDb: string[] = [];
		const extraInDb: string[] = [];
		const fieldMismatches: string[] = [];

		// Fields to compare (exclude id because it's only a key and case-normalized already)
		const fields: (keyof (typeof newTeams)[number])[] = [
			"deleted",
			"goal",
			"hexcode",
			"notes",
			"teamName",
		];

		for (const [lcId, src] of sourceById.entries()) {
			const dest = savedById.get(lcId);
			if (!dest) {
				missingInDb.push(src.id); // use original casing from source
				continue;
			}
			for (const f of fields) {
				const sv = (src as any)[f];
				const dv = (dest as any)[f];
				// Treat undefined and null as equivalent empty states; also normalize trimming for strings
				const norm = (v: any) => {
					if (v === null || v === undefined) {
						return "";
					}
					if (typeof v === "string") {
						return v.trim();
					}
					return v;
				};
				if (norm(sv) !== norm(dv)) {
					fieldMismatches.push(
						`${src.id}:${String(f)} expected='${sv}' actual='${dv}'`,
					);
				}
			}
		}

		for (const [lcId, dest] of savedById.entries()) {
			if (!sourceById.has(lcId)) {
				extraInDb.push(dest.id);
			}
		}

		if (
			missingInDb.length === 0 &&
			extraInDb.length === 0 &&
			fieldMismatches.length === 0
		) {
			logs.push(
				`Teams verification passed: ${savedTeams.length} rows match source exactly (UUID case ignored)`,
			);
		} else {
			if (missingInDb.length) {
				logs.push(`Verification missing in DB: ${missingInDb.join(",")}`);
			}
			if (extraInDb.length) {
				logs.push(`Verification extra in DB: ${extraInDb.join(",")}`);
			}
			if (fieldMismatches.length) {
				logs.push(`Verification field mismatches (${fieldMismatches.length}):`);
				for (const mm of fieldMismatches.slice(0, 25)) {
					logs.push(`  ${mm}`);
				}
				if (fieldMismatches.length > 25) {
					logs.push(
						`  ... ${fieldMismatches.length - 25} more (showing first 25)`,
					);
				}
			}
		}
	} catch (error) {
		logs.push(`Error in Teams Insert: ${ErrorToString(error)}`);
	}

	return logs;
}

/**
 * Generic helper for simple tables that follow the pattern:
 *  - delete all rows
 *  - read legacy rows
 *  - transform rows
 *  - save via *Data.SaveX(event, rows)
 *  - verify round-trip (case-insensitive id, selected fields)
 */
async function CopySimpleTable<TLegacy, TModel>(
	event: H3Event<EventHandlerRequest>,
	db: SupabaseClient,
	options: {
		label: string; // human readable e.g. "Badge Categories"
		tableName: string; // Supabase table name
		readLegacy: () => Promise<TLegacy[]>;
		transform: (legacy: TLegacy[]) => TModel[];
		save: (
			event: H3Event<EventHandlerRequest>,
			models: TModel[],
		) => Promise<TModel[]>; // returns saved rows
		getAll: (event: H3Event<EventHandlerRequest>) => Promise<TModel[]>; // read back for verification
		fields: (keyof TModel)[]; // fields (excluding id) to compare
	},
): Promise<string[]> {
	const logs: string[] = [];

	// Delete existing
	const { error: delError } = await db
		.schema("coderdojo")
		.from(options.tableName)
		.delete()
		.not("id", "is", null);
	if (delError) {
		logs.push(
			`Error deleting ${options.label.toLowerCase()}: ${delError.message}`,
		);
	} else {
		logs.push(`${options.label} deleted successfully`);
	}

	logs.push(`Reading ${options.label.toLowerCase()}`);
	const legacy = await options.readLegacy();
	logs.push(
		`Copying ${options.label.toLowerCase()} table with ${legacy.length} rows`,
	);
	const models = options.transform(legacy);

	try {
		await options.save(event, models);
		logs.push(`Inserted ${options.label.toLowerCase()}`);

		// Verification
		const saved = await options.getAll(event);
		const srcById = new Map<any, any>(
			models.map((m: any) => [String(m.id).toLowerCase(), m]),
		);
		const destById = new Map<any, any>(
			saved.map((m: any) => [String(m.id).toLowerCase(), m]),
		);

		const missing: string[] = [];
		const extra: string[] = [];
		const mismatches: string[] = [];

		const norm = (v: any) => {
			if (v === null || v === undefined) {
				return "";
			}
			if (typeof v === "string") {
				return v.trim();
			}
			return v;
		};

		for (const [id, src] of srcById.entries()) {
			const dest = destById.get(id);
			if (!dest) {
				missing.push((src as any).id);
				continue;
			}
			for (const f of options.fields) {
				const rawSv = (src as any)[f];
				const rawDv = (dest as any)[f];
				const sv = norm(rawSv);
				const dv = norm(rawDv);
				const fieldName = String(f);
				// If this looks like an ID field (ends with 'id') or both strings are UUID-like, compare case-insensitively
				if (typeof rawSv === "string" && typeof rawDv === "string") {
					const isIdField = fieldName.toLowerCase().endsWith("id");
					const uuidRegex =
						/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
					if (isIdField || (uuidRegex.test(rawSv) && uuidRegex.test(rawDv))) {
						if (rawSv.toLowerCase() === rawDv.toLowerCase()) continue; // treat as equal ignoring case
						// else keep original values for mismatch report (uncommon different IDs)
					}
				}
				if (sv !== dv) {
					mismatches.push(
						`${(src as any).id}:${fieldName} expected='${rawSv}' actual='${rawDv}'`,
					);
				}
			}
		}
		for (const [id, dest] of destById.entries()) {
			if (!srcById.has(id)) {
				extra.push((dest as any).id);
			}
		}

		if (!missing.length && !extra.length && !mismatches.length) {
			logs.push(
				`${options.label} verification passed: ${saved.length} rows match source exactly (UUID case ignored)`,
			);
		} else {
			if (missing.length) {
				logs.push(
					`${options.label} verification missing in DB: ${missing.join(",")}`,
				);
			}
			if (extra.length) {
				logs.push(
					`${options.label} verification extra in DB: ${extra.join(",")}`,
				);
			}
			if (mismatches.length) {
				logs.push(
					`${options.label} verification field mismatches (${mismatches.length}):`,
				);
				for (const mm of mismatches.slice(0, 25)) {
					logs.push(`  ${mm}`);
				}
				if (mismatches.length > 25) {
					logs.push(`  ... ${mismatches.length - 25} more (showing first 25)`);
				}
			}
		}
	} catch (error) {
		logs.push(`Error in ${options.label} insert: ${ErrorToString(error)}`);
	}

	return logs;
}

/**
 * Copy badge categories table
 */
async function CopyBadgeCategoriesTable(
	event: H3Event<EventHandlerRequest>,
	db: SupabaseClient,
): Promise<string[]> {
	return CopySimpleTable(event, db, {
		label: "Badge Categories",
		tableName: "badge_categories",
		readLegacy: ReadLegacyBadgeCategories,
		transform: FromLegacyBadgeCategoryEntities as any,
		save: (e, rows) => BadgeCategoriesData.SaveBadgeCategories(e, rows as any),
		getAll: (e) => BadgeCategoriesData.GetBadgeCategories(e, true),
		fields: ["deleted", "categoryName", "categoryDescription"] as any,
	});
}

/**
 * Copy badges table
 */
async function CopyBadgesTable(
	event: H3Event<EventHandlerRequest>,
	db: SupabaseClient,
): Promise<string[]> {
	return CopySimpleTable(event, db, {
		label: "Badges",
		tableName: "badges",
		readLegacy: ReadLegacyBadges,
		transform: FromLegacyBadgeEntities as any,
		save: (e, rows) => BadgesData.SaveBadges(e, rows as any),
		// includeDeleted passed true to ensure full table copy including soft-deleted rows
		getAll: (e) => BadgesData.GetBadges(e, true),
		fields: ["deleted", "achievement", "badgeCategoryId", "description"] as any,
	});
}

/**
 * Copy belts table
 */
async function CopyBeltsTable(
	event: H3Event<EventHandlerRequest>,
	db: SupabaseClient,
): Promise<string[]> {
	return CopySimpleTable(event, db, {
		label: "Belts",
		tableName: "belts",
		readLegacy: ReadLegacyBelts,
		transform: FromLegacyBeltEntities as any,
		save: (e, rows) => BeltsData.SaveBelts(e, rows as any),
		getAll: (e) => BeltsData.GetBelts(e, true),
		fields: ["deleted", "color", "hexCode", "description", "sortOrder"] as any,
	});
}

/**
 * Copy members (combining legacy ninjas and adults)
 * Password hashes are NOT migrated here (MemberModel excludes them). A separate
 * process can call MembersData.BulkMigrateLegacyPasswords afterwards if desired.
 */
async function CopyMembersTable(
	event: H3Event<EventHandlerRequest>,
	db: SupabaseClient,
): Promise<string[]> {
	const logs: string[] = [];
	// Delete existing members
	const { error: delError } = await db
		.schema("coderdojo")
		.from("members")
		.delete()
		.not("id", "is", null);
	if (delError) {
		logs.push(`Error deleting members: ${delError.message}`);
	} else {
		logs.push("Members deleted successfully");
	}

	logs.push("Reading legacy ninjas and adults");
	const ninjas = await ReadLegacyNinjas();
	const adults = await ReadLegacyAdults();
	logs.push(
		`Copying members table with ${ninjas.length} ninjas and ${adults.length} adults`,
	);

	const ninjaModels = FromLegacyMemberEntities(ninjas);
	const adultModels = FromLegacyAdultEntities(adults);
	const allModels = [...ninjaModels, ...adultModels];

	// Summary metrics
	const ninjaCount = ninjaModels.length;
	const adultCount = adultModels.length;
	const mentorCount = adultModels.filter((a) => a.isMentor).length;
	logs.push(
		`Members source metrics: ninjas=${ninjaCount} adults=${adultCount} mentors=${mentorCount} total=${allModels.length}`,
	);

	try {
		// Supabase has a practical limit (~1000 rows) per upsert call. Batch to ensure all members insert first.
		const batchSize = 500;
		let insertedTotal = 0;
		for (let i = 0; i < allModels.length; i += batchSize) {
			const batch = allModels.slice(i, i + batchSize);
			const savedBatch = await MembersData.SaveMembers(event, batch);
			insertedTotal += savedBatch.length;
			logs.push(
				`Inserted member batch ${i / batchSize + 1} size=${batch.length} returned=${savedBatch.length}`,
			);
			if (savedBatch.length !== batch.length) {
				logs.push(
					`Warning: batch mismatch expected=${batch.length} got=${savedBatch.length}`,
				);
			}
		}
		logs.push(
			`Inserted members total=${insertedTotal} expected=${allModels.length}`,
		);

		// Brief delay to mitigate any read-after-write lag
		await new Promise((res) => setTimeout(res, 250));
		// Verification (paged fetch to avoid row limits ~1000 per request)
		const dbClient = await GetSupabaseAdminClient(event);
		let saved: any[] = [];
		if (dbClient) {
			const pageSize = 1000;
			let from = 0;
			let page = 0;
			while (true) {
				const { data, error } = await dbClient
					.schema("coderdojo")
					.from("members")
					.select("*")
					.range(from, from + pageSize - 1);
				if (error) {
					logs.push(`Verification fetch error page ${page}: ${error.message}`);
					break;
				}
				if (data && data.length) {
					saved.push(...data);
					logs.push(
						`Verification fetched page ${page + 1} size=${data.length}`,
					);
					if (data.length < pageSize) break; // last page
					from += pageSize;
					page++;
				} else {
					break;
				}
			}
			// Map raw records to MemberModel shape via shared helper
			saved = memberFromRecords(saved as any);
		} else {
			logs.push("Verification aborted: no DB client");
			return logs;
		}
		const srcById = new Map<any, any>(
			allModels.map((m) => [m.id.toLowerCase(), m]),
		);
		const destById = new Map<any, any>(
			saved.map((m) => [m.id.toLowerCase(), m]),
		);

		const missing: string[] = [];
		const extra: string[] = [];
		const mismatches: string[] = [];
		// No diagnostics; tolerance handles acceptable differences

		const fields: (keyof (typeof allModels)[number])[] = [
			"deleted",
			"birthYear",
			"email",
			"fingerprintId",
			"gardaVetted",
			"githubLogin",
			"goalLongTerm",
			"goalShortTerm",
			"isMentor",
			"isNinja",
			"isParent",
			"login",
			"loginDate",
			"loginDatePrevious",
			"nameFirst",
			"nameLast",
			"phone",
			"registeredCurrentTerm",
			"scratchName",
			"teamId",
			"xboxGamertag",
		];
		const norm = (v: any) => {
			if (v === null || v === undefined) return "";
			if (typeof v === "string") return v.trim();
			return v;
		};
		for (const [id, src] of srcById.entries()) {
			const dest = destById.get(id);
			if (!dest) {
				missing.push(src.id);
				continue;
			}
			for (const f of fields) {
				const rawSv = (src as any)[f];
				const rawDv = (dest as any)[f];
				const sv = norm(rawSv);
				const dv = norm(rawDv);
				const fieldName = String(f);
				if (
					typeof rawSv === "string" &&
					typeof rawDv === "string" &&
					fieldName.toLowerCase().endsWith("id")
				) {
					if (rawSv.toLowerCase() === rawDv.toLowerCase()) continue;
				}
				if (sv !== dv) {
					if (
						(fieldName === "loginDate" || fieldName === "loginDatePrevious") &&
						typeof rawSv === "number" &&
						typeof rawDv === "number"
					) {
						const diff = Math.abs(rawDv - rawSv);
						if (diff <= TIME_TOLERANCE_MS) continue; // tolerate within 6 hours
					}
					mismatches.push(
						`${src.id}:${fieldName} expected='${rawSv}' actual='${rawDv}'`,
					);
				}
			}
		}
		for (const [id, dest] of destById.entries())
			if (!srcById.has(id)) extra.push(dest.id);

		let verificationPassed = false;
		if (!missing.length && !extra.length && !mismatches.length) {
			logs.push(
				`Members verification passed: ${saved.length} rows match source exactly (UUID case ignored)`,
			);
			verificationPassed = true;
		} else {
			if (missing.length)
				logs.push(`Members verification missing in DB: ${missing.join(",")}`);
			if (extra.length)
				logs.push(`Members verification extra in DB: ${extra.join(",")}`);
			if (mismatches.length) {
				logs.push(
					`Members verification field mismatches (${mismatches.length}):`,
				);
				for (const mm of mismatches.slice(0, 25)) logs.push("  " + mm);
				if (mismatches.length > 25)
					logs.push(`  ... ${mismatches.length - 25} more (showing first 25)`);
			}
			// (Probe diagnostics removed for cleaner logs)
		}

		// Bulk password migration AFTER verification so it cannot affect field comparison above
		if (verificationPassed) {
			try {
				logs.push("Migrating legacy member passwords (mentors)...");
				const passwordResult = await MembersData.BulkMigrateLegacyPasswords(
					event,
					allModels.map((m) => ({
						id: m.id,
						nameFirst: m.nameFirst,
						nameLast: m.nameLast,
						fingerprintId: m.fingerprintId,
						isMentor: m.isMentor,
						deleted: m.deleted,
					})),
					{ force: true },
				);
				logs.push(
					`Password migration: updated=${passwordResult.updated} skipped=${passwordResult.skipped} errors=${passwordResult.errors}`,
				);
			} catch (pwErr: any) {
				logs.push(`Error migrating passwords: ${pwErr.message || pwErr}`);
			}
		} else {
			logs.push(
				"Skipping password migration due to failed member verification",
			);
		}
	} catch (error) {
		logs.push(`Error in Members insert: ${ErrorToString(error)}`);
	}
	return logs;
}

/**
 * Copy sessions table with pagination verification
 */
async function CopySessionsTable(
	event: H3Event<EventHandlerRequest>,
	db: SupabaseClient,
): Promise<string[]> {
	const logs: string[] = [];
	const { error: delError } = await db
		.schema("coderdojo")
		.from("sessions")
		.delete()
		.not("id", "is", null);
	if (delError) {
		logs.push(`Error deleting sessions: ${ErrorToString(delError)}`);
	} else {
		logs.push("Sessions deleted successfully");
	}

	const legacyMember = await ReadLegacyMemberAttendances();
	const legacyAdult = await ReadLegacyAdultAttendances();
	const memberModels: MemberAttendanceModel[] =
		FromLegacyMemberAttendanceEntities(legacyMember);
	const adultModels: MemberAttendanceModel[] =
		FromLegacyAdultAttendanceEntities(legacyAdult);
	const allAttendance: MemberAttendanceModel[] = [
		...memberModels,
		...adultModels,
	].sort((a, b) => a.date.localeCompare(b.date));

	const models: SessionModel[] = [];
	for (const att of allAttendance) {
		const sessionDate = new Date(att.date).toISOString().substring(0, 10);
		if (!models.find(m => m.sessionDate === sessionDate)) {
			models.push({
				id: att.id,
				sessionDate,
				topic: "",
				mentorsOnly: false,
				deleted: false,
			});
		}
	}
	logs.push(
		`Copying sessions table with attendances=${allAttendance.length} sessions=${models.length}`,
	);

	try {
		const { data, error } = await db
			.schema("coderdojo")
			.from("sessions")
			.upsert(
				models.map((m) => {
					return sessionToRecord(m);
				}),
			)
			.select();
		if (error) {
			logs.push(
				`Error inserting sessions: ${error.message}`,
			);
			return logs;
		}
		logs.push(`Inserted ${models.length} sessions`);
	} catch (e: any) {
		logs.push(`Error in Sessions insert: ${e.message}`);
	}
	return logs;
}

/**
 * Copy member attendance (member + adult) with de-dup and pagination verification
 */
async function CopyAttendanceTable(
	event: H3Event<EventHandlerRequest>,
	db: SupabaseClient,
): Promise<string[]> {
	const logs: string[] = [];
	const { error: delError } = await db
		.schema("coderdojo")
		.from("member_attendances")
		.delete()
		.not("id", "is", null);

	if (delError) logs.push(`Error deleting attendances: ${delError.message}`);
	else logs.push("Attendances deleted successfully");

	const legacyMember = await ReadLegacyMemberAttendances();
	const legacyAdult = await ReadLegacyAdultAttendances();
	logs.push(
		`Copying attendance table with memberRows=${legacyMember.length} adultRows=${legacyAdult.length}`,
	);
	const memberModels: MemberAttendanceModel[] =
		FromLegacyMemberAttendanceEntities(legacyMember);
	const adultModels: MemberAttendanceModel[] =
		FromLegacyAdultAttendanceEntities(legacyAdult);
	const allAttendance: MemberAttendanceModel[] = [
		...memberModels,
		...adultModels,
	].sort((a, b) => a.date.localeCompare(b.date));
	try {
		const pageSize = 1000;
		for (let i = 0; i < allAttendance.length; i += pageSize) {
			const batch = allAttendance.slice(i, i + pageSize);
			const { error } = await db
				.schema("coderdojo")
				.from("member_attendances")
				.upsert(
					batch.map((a) => ({ id: a.id, member_id: a.memberId, date: a.date })),
					{ onConflict: "id" },
				);
			if (error) {
				logs.push(
					`Error inserting attendance batch ${i / pageSize + 1}: ${error.message}`,
				);
				return logs;
			}
		}
		logs.push("Inserted attendances");
		await new Promise((r) => setTimeout(r, 200));
		const fetched: any[] = [];
		let from = 0;
		const fetchSize = 1000;
		let page = 0;
		while (true) {
			const { data, error } = await db
				.schema("coderdojo")
				.from("member_attendances")
				.select("*")
				.range(from, from + fetchSize - 1);
			if (error) {
				logs.push(
					`Attendance verification fetch error page ${page}: ${error.message}`,
				);
				break;
			}
			if (data && data.length) {
				fetched.push(...data);
				logs.push(
					`Attendance verification fetched page ${page + 1} size=${data.length}`,
				);
				if (data.length < fetchSize) break;
				from += fetchSize;
				page++;
			} else break;
		}
		const srcById = new Map(allAttendance.map((a) => [a.id.toLowerCase(), a]));
		const badSourceIds: any[] = [];
		const safeSourceEntries: [string, any][] = [];
		for (const a of allAttendance) {
			if (!a || !a.id) {
				badSourceIds.push(a);
				continue;
			}
			try {
				safeSourceEntries.push([String(a.id).toLowerCase(), a]);
			} catch {
				badSourceIds.push(a);
			}
		}
		const srcByIdSafe = new Map(safeSourceEntries);
		const badDestIds: any[] = [];
		const safeDestEntries: [string, any][] = [];
		for (const r of fetched) {
			if (!r || !r.id) {
				badDestIds.push(r);
				continue;
			}
			try {
				safeDestEntries.push([String(r.id).toLowerCase(), r]);
			} catch {
				badDestIds.push(r);
			}
		}
		const destById = new Map(safeDestEntries);
		const missing: string[] = [];
		const extra: string[] = [];
		const mismatches: string[] = [];
		for (const [id, src] of srcByIdSafe.entries()) {
			const dest = destById.get(id);
			if (!dest) {
				missing.push(src.id);
				continue;
			}
			if (
				src.memberId &&
				dest.member_id &&
				src.memberId.toLowerCase() !== String(dest.member_id).toLowerCase()
			)
				mismatches.push(
					`${src.id}:memberId exp='${src.memberId}' act='${dest.member_id}'`,
				);
			if (src.date !== dest.date)
				mismatches.push(`${src.id}:date exp='${src.date}' act='${dest.date}'`);
		}
		for (const [id, dest] of destById.entries())
			if (!srcById.has(id)) extra.push(dest.id);
		if (badSourceIds.length)
			logs.push(
				`Attendance skipped invalid source rows=${badSourceIds.length}`,
			);
		if (badDestIds.length)
			logs.push(
				`Attendance encountered invalid fetched rows=${badDestIds.length}`,
			);
		if (!missing.length && !extra.length && !mismatches.length)
			logs.push(
				`Attendance verification passed: ${fetched.length} rows match source exactly (UUID case ignored)`,
			);
		else {
			if (missing.length)
				logs.push(
					`Attendance verification missing in DB: ${missing.join(",")}`,
				);
			if (extra.length)
				logs.push(`Attendance verification extra in DB: ${extra.join(",")}`);
			if (mismatches.length) {
				logs.push(`Attendance verification mismatches (${mismatches.length}):`);
				for (const mm of mismatches.slice(0, 25)) logs.push("  " + mm);
				if (mismatches.length > 25)
					logs.push(`  ... ${mismatches.length - 25} more`);
			}
		}
	} catch (e: any) {
		logs.push(`Error in Attendance insert: ${e.message}`);
	}
	return logs;
}

/**
 * Copy member badge categories relationship table (adult badge categories in legacy)
 */
async function CopyMemberBadgeCategoriesTable(
	event: H3Event<EventHandlerRequest>,
	db: SupabaseClient,
): Promise<string[]> {
	const logs: string[] = [];
	const { error: delError } = await db
		.schema("coderdojo")
		.from("member_badge_categories")
		.delete()
		.not("id", "is", null);
	if (delError)
		logs.push(`Error deleting member_badge_categories: ${delError.message}`);
	else logs.push("Member badge categories deleted successfully");
	const legacy = await ReadLegacyAdultBadgeCategories();
	const models = FromLegacyAdultBadgeCategoryEntities(legacy);
	logs.push(`Copying member_badge_categories with ${models.length} rows`);
	try {
		// upsert in batches
		const batchSize = 1000;
		for (let i = 0; i < models.length; i += batchSize) {
			const batch = models.slice(i, i + batchSize);
			const { error } = await db
				.schema("coderdojo")
				.from("member_badge_categories")
				.upsert(
					batch.map((m) => ({
						id: m.id,
						member_id: m.memberId,
						badge_category_id: m.badgeCategoryId,
					})),
					{ onConflict: "id" },
				);
			if (error) {
				logs.push(
					`Error inserting member_badge_categories batch ${i / batchSize + 1}: ${error.message}`,
				);
				return logs;
			}
		}
		logs.push("Inserted member badge categories");
		await new Promise((r) => setTimeout(r, 150));
		// verification
		const fetched: any[] = [];
		let from = 0;
		const fetchSize = 1000;
		let page = 0;
		while (true) {
			const { data, error } = await db
				.schema("coderdojo")
				.from("member_badge_categories")
				.select("*")
				.range(from, from + fetchSize - 1);
			if (error) {
				logs.push(
					`member_badge_categories verification fetch error page ${page}: ${error.message}`,
				);
				break;
			}
			if (data && data.length) {
				fetched.push(...data);
				if (data.length < fetchSize) break;
				from += fetchSize;
				page++;
			} else break;
		}
		const srcById = new Map(models.map((m) => [m.id.toLowerCase(), m]));
		const destById = new Map(
			fetched.map((r) => [String(r.id).toLowerCase(), r]),
		);
		const missing: string[] = [];
		const extra: string[] = [];
		const mismatches: string[] = [];
		for (const [id, src] of srcById.entries()) {
			const dest = destById.get(id);
			if (!dest) {
				missing.push(src.id);
				continue;
			}
			if (src.memberId.toLowerCase() !== String(dest.member_id).toLowerCase())
				mismatches.push(
					`${src.id}:memberId exp='${src.memberId}' act='${dest.member_id}'`,
				);
			if (
				src.badgeCategoryId.toLowerCase() !==
				String(dest.badge_category_id).toLowerCase()
			)
				mismatches.push(
					`${src.id}:badgeCategoryId exp='${src.badgeCategoryId}' act='${dest.badge_category_id}'`,
				);
		}
		for (const [id, dest] of destById.entries())
			if (!srcById.has(id)) extra.push(dest.id);
		if (!missing.length && !extra.length && !mismatches.length)
			logs.push(
				`Member badge categories verification passed: ${fetched.length} rows match source (UUID case ignored)`,
			);
		else {
			if (missing.length)
				logs.push(
					`Member badge categories missing in DB: ${missing.join(",")}`,
				);
			if (extra.length)
				logs.push(`Member badge categories extra in DB: ${extra.join(",")}`);
			if (mismatches.length) {
				logs.push(`Member badge categories mismatches (${mismatches.length}):`);
				for (const mm of mismatches.slice(0, 25)) logs.push("  " + mm);
				if (mismatches.length > 25)
					logs.push(`  ... ${mismatches.length - 25} more`);
			}
		}
	} catch (e: any) {
		logs.push(`Error in member_badge_categories insert: ${e.message}`);
	}
	return logs;
}

/**
 * Copy member parents relationship table
 */
async function CopyMemberParentsTable(
	event: H3Event<EventHandlerRequest>,
	db: SupabaseClient,
): Promise<string[]> {
	const logs: string[] = [];
	const { error: delError } = await db
		.schema("coderdojo")
		.from("member_parents")
		.delete()
		.not("id", "is", null);
	if (delError) logs.push(`Error deleting member_parents: ${delError.message}`);
	else logs.push("Member parents deleted successfully");
	const legacy = await ReadLegacyMemberParents();
	const models = FromLegacyMemberParentEntities(legacy);
	logs.push(`Copying member_parents with ${models.length} rows`);
	try {
		const batchSize = 1000;
		for (let i = 0; i < models.length; i += batchSize) {
			const batch = models.slice(i, i + batchSize);
			const { error } = await db
				.schema("coderdojo")
				.from("member_parents")
				.upsert(
					batch.map((m) => ({
						id: m.id,
						member_id: m.memberId,
						parent_id: m.parentId,
					})),
					{ onConflict: "id" },
				);
			if (error) {
				logs.push(
					`Error inserting member_parents batch ${i / batchSize + 1}: ${error.message}`,
				);
				return logs;
			}
		}
		logs.push("Inserted member parents");
		await new Promise((r) => setTimeout(r, 150));
		const fetched: any[] = [];
		let from = 0;
		const fetchSize = 1000;
		let page = 0;
		while (true) {
			const { data, error } = await db
				.schema("coderdojo")
				.from("member_parents")
				.select("*")
				.range(from, from + fetchSize - 1);
			if (error) {
				logs.push(
					`member_parents verification fetch error page ${page}: ${error.message}`,
				);
				break;
			}
			if (data && data.length) {
				fetched.push(...data);
				if (data.length < fetchSize) break;
				from += fetchSize;
				page++;
			} else break;
		}
		const srcById = new Map(models.map((m) => [m.id.toLowerCase(), m]));
		const destById = new Map(
			fetched.map((r) => [String(r.id).toLowerCase(), r]),
		);
		const missing: string[] = [];
		const extra: string[] = [];
		const mismatches: string[] = [];
		for (const [id, src] of srcById.entries()) {
			const dest = destById.get(id);
			if (!dest) {
				missing.push(src.id);
				continue;
			}
			if (src.memberId.toLowerCase() !== String(dest.member_id).toLowerCase())
				mismatches.push(
					`${src.id}:memberId exp='${src.memberId}' act='${dest.member_id}'`,
				);
			if (src.parentId.toLowerCase() !== String(dest.parent_id).toLowerCase())
				mismatches.push(
					`${src.id}:parentId exp='${src.parentId}' act='${dest.parent_id}'`,
				);
		}
		for (const [id, dest] of destById.entries())
			if (!srcById.has(id)) extra.push(dest.id);
		if (!missing.length && !extra.length && !mismatches.length)
			logs.push(
				`Member parents verification passed: ${fetched.length} rows match source (UUID case ignored)`,
			);
		else {
			if (missing.length)
				logs.push(`Member parents missing in DB: ${missing.join(",")}`);
			if (extra.length)
				logs.push(`Member parents extra in DB: ${extra.join(",")}`);
			if (mismatches.length) {
				logs.push(`Member parents mismatches (${mismatches.length}):`);
				for (const mm of mismatches.slice(0, 25)) logs.push("  " + mm);
				if (mismatches.length > 25)
					logs.push(`  ... ${mismatches.length - 25} more`);
			}
		}
	} catch (e: any) {
		logs.push(`Error in member_parents insert: ${e.message}`);
	}
	return logs;
}

// Helper: compare dates with tolerance
function datesEqualWithTolerance(a: number | null, b: number | null): boolean {
	if (a == null && b == null) return true;
	if (a == null || b == null) return false;
	return Math.abs(a - b) <= TIME_TOLERANCE_MS;
}

/**
 * Copy member badges table
 */
async function CopyMemberBadgesTable(
	event: H3Event<EventHandlerRequest>,
	db: SupabaseClient,
): Promise<string[]> {
	const logs: string[] = [];
	const { error: delError } = await db
		.schema("coderdojo")
		.from("member_badges")
		.delete()
		.not("id", "is", null);
	if (delError) logs.push(`Error deleting member_badges: ${delError.message}`);
	else logs.push("Member badges deleted successfully");
	const legacy = await ReadLegacyMemberBadges();
	const models = FromLegacyMemberBadgeEntities(legacy);
	logs.push(`Copying member_badges with ${models.length} rows`);
	try {
		const batchSize = 500;
		for (let i = 0; i < models.length; i += batchSize) {
			const batch = models.slice(i, i + batchSize);
			const { error } = await db
				.schema("coderdojo")
				.from("member_badges")
				.upsert(
					batch.map((m) => ({
						id: m.id,
						member_id: m.memberId,
						badge_id: m.badgeId,
						awarded_by_adult_id: m.awardedByAdultId,
						application_notes: m.applicationNotes,
						awarded_notes: m.awardedNotes,
						rejected_notes: m.rejectedNotes,
						rejected_by_adult_id: m.rejectedByAdultId,
						application_date: m.applicationDate
							? new Date(m.applicationDate).toISOString()
							: null,
						awarded: m.awarded ? new Date(m.awarded).toISOString() : null,
						rejected_date: m.rejectedDate
							? new Date(m.rejectedDate).toISOString()
							: null,
						goal_date: m.goalDate ? new Date(m.goalDate).toISOString() : null,
					})),
					{ onConflict: "id" },
				);
			if (error) {
				logs.push(
					`Error inserting member_badges batch ${i / batchSize + 1}: ${error.message}`,
				);
				return logs;
			}
		}
		logs.push("Inserted member badges");
		await new Promise((r) => setTimeout(r, 150));
		// verification
		const fetched: any[] = [];
		let from = 0;
		const fetchSize = 1000;
		let page = 0;
		while (true) {
			const { data, error } = await db
				.schema("coderdojo")
				.from("member_badges")
				.select("*")
				.range(from, from + fetchSize - 1);
			if (error) {
				logs.push(
					`member_badges verification fetch error page ${page}: ${error.message}`,
				);
				break;
			}
			if (data && data.length) {
				fetched.push(...data);
				if (data.length < fetchSize) break;
				from += fetchSize;
				page++;
			} else break;
		}
		const srcById = new Map(models.map((m) => [m.id.toLowerCase(), m]));
		const destById = new Map(
			fetched.map((r) => [String(r.id).toLowerCase(), r]),
		);
		const missing: string[] = [];
		const extra: string[] = [];
		const mismatches: string[] = [];
		for (const [id, src] of srcById.entries()) {
			const dest = destById.get(id);
			if (!dest) {
				missing.push(src.id);
				continue;
			}
			// Case-insensitive UUID comparisons
			const ci = (a: string | null, b: string | null, field: string) => {
				if (a == null && b == null) return;
				if (a == null || b == null) {
					mismatches.push(`${src.id}:${field} exp='${a}' act='${b}'`);
					return;
				}
				if (a.toLowerCase() !== b.toLowerCase())
					mismatches.push(`${src.id}:${field} exp='${a}' act='${b}'`);
			};
			ci(src.memberId, String(dest.member_id), "memberId");
			ci(src.badgeId, String(dest.badge_id), "badgeId");
			ci(src.awardedByAdultId, dest.awarded_by_adult_id, "awardedByAdultId");
			ci(src.rejectedByAdultId, dest.rejected_by_adult_id, "rejectedByAdultId");
			// Notes - trim compare
			const trimEq = (a: any, b: any, f: string) => {
				const ta = (a ?? "").toString().trim();
				const tb = (b ?? "").toString().trim();
				if (ta !== tb) mismatches.push(`${src.id}:${f} exp='${a}' act='${b}'`);
			};
			trimEq(src.applicationNotes, dest.application_notes, "applicationNotes");
			trimEq(src.awardedNotes, dest.awarded_notes, "awardedNotes");
			trimEq(src.rejectedNotes, dest.rejected_notes, "rejectedNotes");
			// Dates with tolerance
			const parseOrNull = (v: any) => (v ? Date.parse(v) : null);
			const dApp = parseOrNull(dest.application_date);
			const dAwd = parseOrNull(dest.awarded);
			const dRej = parseOrNull(dest.rejected_date);
			const dGoal = parseOrNull(dest.goal_date);
			if (!datesEqualWithTolerance(src.applicationDate, dApp))
				mismatches.push(
					`${src.id}:applicationDate exp='${src.applicationDate}' act='${dApp}'`,
				);
			if (!datesEqualWithTolerance(src.awarded, dAwd))
				mismatches.push(`${src.id}:awarded exp='${src.awarded}' act='${dAwd}'`);
			if (!datesEqualWithTolerance(src.rejectedDate, dRej))
				mismatches.push(
					`${src.id}:rejectedDate exp='${src.rejectedDate}' act='${dRej}'`,
				);
			if (!datesEqualWithTolerance(src.goalDate, dGoal))
				mismatches.push(
					`${src.id}:goalDate exp='${src.goalDate}' act='${dGoal}'`,
				);
		}
		for (const [id, dest] of destById.entries())
			if (!srcById.has(id)) extra.push(dest.id);
		if (!missing.length && !extra.length && !mismatches.length)
			logs.push(
				`Member badges verification passed: ${fetched.length} rows match source (UUID case + date tolerance)`,
			);
		else {
			if (missing.length)
				logs.push(`Member badges missing in DB: ${missing.join(",")}`);
			if (extra.length)
				logs.push(`Member badges extra in DB: ${extra.join(",")}`);
			if (mismatches.length) {
				logs.push(`Member badges mismatches (${mismatches.length}):`);
				for (const mm of mismatches.slice(0, 25)) logs.push("  " + mm);
				if (mismatches.length > 25)
					logs.push(`  ... ${mismatches.length - 25} more`);
			}
		}
	} catch (e: any) {
		logs.push(`Error in member_badges insert: ${e.message}`);
	}
	return logs;
}

/**
 * Copy member belts table
 */
async function CopyMemberBeltsTable(
	event: H3Event<EventHandlerRequest>,
	db: SupabaseClient,
): Promise<string[]> {
	const logs: string[] = [];
	const { error: delError } = await db
		.schema("coderdojo")
		.from("member_belts")
		.delete()
		.not("id", "is", null);
	if (delError) logs.push(`Error deleting member_belts: ${delError.message}`);
	else logs.push("Member belts deleted successfully");
	const legacy = await ReadLegacyMemberBelts();
	const models = FromLegacyMemberBeltEntities(legacy);
	logs.push(`Copying member_belts with ${models.length} rows`);
	try {
		const batchSize = 500;
		for (let i = 0; i < models.length; i += batchSize) {
			const batch = models.slice(i, i + batchSize);
			const { error } = await db
				.schema("coderdojo")
				.from("member_belts")
				.upsert(
					batch.map((m) => ({
						id: m.id,
						member_id: m.memberId,
						belt_id: m.beltId,
						awarded_by_adult_id: m.awardedByAdultId,
						application_notes: m.applicationNotes,
						awarded_notes: m.awardedNotes,
						rejected_notes: m.rejectedNotes,
						rejected_by_adult_id: m.rejectedByAdultId,
						application_date: m.applicationDate
							? new Date(m.applicationDate).toISOString()
							: null,
						awarded: m.awarded ? new Date(m.awarded).toISOString() : null,
						rejected_date: m.rejectedDate
							? new Date(m.rejectedDate).toISOString()
							: null,
					})),
					{ onConflict: "id" },
				);
			if (error) {
				logs.push(
					`Error inserting member_belts batch ${i / batchSize + 1}: ${error.message}`,
				);
				return logs;
			}
		}
		logs.push("Inserted member belts");
		await new Promise((r) => setTimeout(r, 150));
		// verification
		const fetched: any[] = [];
		let from = 0;
		const fetchSize = 1000;
		let page = 0;
		while (true) {
			const { data, error } = await db
				.schema("coderdojo")
				.from("member_belts")
				.select("*")
				.range(from, from + fetchSize - 1);
			if (error) {
				logs.push(
					`member_belts verification fetch error page ${page}: ${error.message}`,
				);
				break;
			}
			if (data && data.length) {
				fetched.push(...data);
				if (data.length < fetchSize) break;
				from += fetchSize;
				page++;
			} else break;
		}
		const srcById = new Map(models.map((m) => [m.id.toLowerCase(), m]));
		const destById = new Map(
			fetched.map((r) => [String(r.id).toLowerCase(), r]),
		);
		const missing: string[] = [];
		const extra: string[] = [];
		const mismatches: string[] = [];
		for (const [id, src] of srcById.entries()) {
			const dest = destById.get(id);
			if (!dest) {
				missing.push(src.id);
				continue;
			}
			const ci = (a: string | null, b: string | null, field: string) => {
				if (a == null && b == null) return;
				if (a == null || b == null) {
					mismatches.push(`${src.id}:${field} exp='${a}' act='${b}'`);
					return;
				}
				if (a.toLowerCase() !== b.toLowerCase())
					mismatches.push(`${src.id}:${field} exp='${a}' act='${b}'`);
			};
			ci(src.memberId, String(dest.member_id), "memberId");
			ci(src.beltId, String(dest.belt_id), "beltId");
			ci(src.awardedByAdultId, dest.awarded_by_adult_id, "awardedByAdultId");
			ci(src.rejectedByAdultId, dest.rejected_by_adult_id, "rejectedByAdultId");
			const trimEq = (a: any, b: any, f: string) => {
				const ta = (a ?? "").toString().trim();
				const tb = (b ?? "").toString().trim();
				if (ta !== tb) mismatches.push(`${src.id}:${f} exp='${a}' act='${b}'`);
			};
			trimEq(src.applicationNotes, dest.application_notes, "applicationNotes");
			trimEq(src.awardedNotes, dest.awarded_notes, "awardedNotes");
			trimEq(src.rejectedNotes, dest.rejected_notes, "rejectedNotes");
			// Dates with tolerance
			const parseOrNull = (v: any) => (v ? Date.parse(v) : null);
			const dApp = parseOrNull(dest.application_date);
			const dAwd = parseOrNull(dest.awarded);
			const dRej = parseOrNull(dest.rejected_date);
			if (!datesEqualWithTolerance(src.applicationDate, dApp))
				mismatches.push(
					`${src.id}:applicationDate exp='${src.applicationDate}' act='${dApp}'`,
				);
			if (!datesEqualWithTolerance(src.awarded, dAwd))
				mismatches.push(`${src.id}:awarded exp='${src.awarded}' act='${dAwd}'`);
			if (!datesEqualWithTolerance(src.rejectedDate, dRej))
				mismatches.push(
					`${src.id}:rejectedDate exp='${src.rejectedDate}' act='${dRej}'`,
				);
		}
		for (const [id, dest] of destById.entries())
			if (!srcById.has(id)) extra.push(dest.id);
		if (!missing.length && !extra.length && !mismatches.length)
			logs.push(
				`Member belts verification passed: ${fetched.length} rows match source (UUID case + date tolerance)`,
			);
		else {
			if (missing.length)
				logs.push(`Member belts missing in DB: ${missing.join(",")}`);
			if (extra.length)
				logs.push(`Member belts extra in DB: ${extra.join(",")}`);
			if (mismatches.length) {
				logs.push(`Member belts mismatches (${mismatches.length}):`);
				for (const mm of mismatches.slice(0, 25)) logs.push("  " + mm);
				if (mismatches.length > 25)
					logs.push(`  ... ${mismatches.length - 25} more`);
			}
		}
	} catch (e: any) {
		logs.push(`Error in member_belts insert: ${e.message}`);
	}
	return logs;
}
