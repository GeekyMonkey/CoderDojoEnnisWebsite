import { defineEventHandler, readBody } from "#imports";
import {
	ReadAdultAttendances,
	ReadAdultBadgeCategories,
	ReadAdults,
	ReadBadgeCategories,
	ReadBadges,
	ReadBelts,
	ReadMemberAttendances,
	ReadMemberBadges,
	ReadMemberBelts,
	ReadMemberParents,
	ReadNinjas,
	ReadSessions,
	ReadTeams,
} from "~~/server/sql/LegacyData";
import { FromLegacyTeamEntities } from "~~/server/sql/Models/LegacyTeamEntity";
import { FromLegacyBadgeCategoryEntities } from "~~/server/sql/Models/LegacyBadgeCategoryEntity";
import { FromLegacyBadgeEntities } from "~~/server/sql/Models/LegacyBadgeEntity";
import { FromLegacyBeltEntities } from "~~/server/sql/Models/LegacyBeltEntity";
import { FromLegacyMemberEntities } from "~~/server/sql/Models/LegacyMemberEntity";
import { FromLegacyAdultEntities } from "~~/server/sql/Models/LegacyAdultEntity";
import { FromLegacySessionEntities } from "~~/server/sql/Models/LegacySessionEntity";
import { FromLegacyMemberAttendanceEntities } from "~~/server/sql/Models/LegacyMemberAttendanceEntity";
import { FromLegacyAdultAttendanceEntities } from "~~/server/sql/Models/LegacyAdultAttendanceEntity";
import { FromLegacyAdultBadgeCategoryEntities } from "~~/server/sql/Models/LegacyAdultBadgeCategoryEntity";
import { FromLegacyMemberParentEntities } from "~~/server/sql/Models/LegacyMemberParentEntity";
import { FromLegacyMemberBadgeEntities } from "~~/server/sql/Models/LegacyMemberBadgeEntity";
import { FromLegacyMemberBeltEntities } from "~~/server/sql/Models/LegacyMemberBeltEntity";
import { DrizzleType, UseDrizzle } from "~~/server/db/UseDrizzle";
import {
	badgeCategories,
	badges,
	belts,
	memberAttendances,
	memberBadgeCategories,
	memberBadges,
	memberBelts,
	memberParents,
	members,
	sessions,
	teams as teamsTable,
} from "~~/server/db/schema/schemas";
import { eq } from "drizzle-orm";

// Define interfaces for the request body and query parameters
type RequestBody = {};

type ResponseBody = {
	logs: string[];
	success: boolean;
};

/**
 * POST: api/Legacy/CopyData
 */
export default defineEventHandler(async (event): Promise<ResponseBody> => {
	// Access request body
	const body: RequestBody = await readBody(event);
	const resp: ResponseBody = {
		logs: [],
		success: false,
	};

	resp.logs.push(...(await CopyData(resp, event)));

	return {
		...resp,
		success: !resp.logs.find((e) => e.toLowerCase().startsWith("error")),
	};
});

/**
 * Copy the SQL Server data to Supabase
 */
async function CopyData(
	resp: ResponseBody,
	event: H3Event<EventHandlerRequest>,
): Promise<string[]> {
	const logs: string[] = [];
	try {
		// Get a DB connection
		const db = UseDrizzle(event);
		logs.push("Drizzle client created");

		// Copy the data (order matters)
		// logs.push(...(await CopyTeamsTable(db)));
		// logs.push(...(await CopyBadgeCategoriesTable(db)));
		// logs.push(...(await CopyBadgesTable(db)));
		// logs.push(...(await CopyBeltsTable(db)));
		logs.push(...(await CopyMembersTable(db)));
		// logs.push(...(await CopySessionsTable(db)));
		// logs.push(...(await CopyAttendanceTable(db)));
		// logs.push(...(await CopyMemberBadgeCategoriesTable(db)));
		// logs.push(...(await CopyMemberParentsTable(db)));
		// logs.push(...(await CopyMemberBadgesTable(db)));
		// logs.push(...(await CopyMemberBeltsTable(db)));
	} catch (error: any) {
		console.error("Error copying data:", error);
		logs.push("Error: " + error.message);
	}
	return logs;
}

/**
 * Copy the teams table
 */
async function CopyTeamsTable(db: DrizzleType): Promise<string[]> {
	const logs: string[] = [];

	logs.push("Purging teams");
	await db.delete(teamsTable).execute();

	logs.push("Reading teams");
	const teams = await ReadTeams();

	logs.push("Copying teams table with " + teams.length + " rows");
	const newTeams = FromLegacyTeamEntities(teams);

	try {
		await db.insert(teamsTable).values(newTeams).execute();
		logs.push(`Inserted teams`);
	} catch (error: any) {
		logs.push("Error in Teams Insert: " + error.message);
	}

	return logs;
}

/**
 * Copy badge categories table
 */
async function CopyBadgeCategoriesTable(db: DrizzleType): Promise<string[]> {
	const logs: string[] = [];

	await db.delete(badgeCategories).execute();

	const oldEntities = await ReadBadgeCategories();
	const newEntities = FromLegacyBadgeCategoryEntities(oldEntities);
	logs.push(
		"Copying badge cateogires table with " + oldEntities.length + " rows",
	);

	try {
		await db.insert(badgeCategories).values(newEntities).execute();
		logs.push(`Inserted badge cateogires`);
	} catch (error: any) {
		logs.push("Error in badge cateogires Insert: " + error.message);
	}

	return logs;
}

/**
 * Copy badges table
 */
async function CopyBadgesTable(db: DrizzleType): Promise<string[]> {
	const logs: string[] = [];

	await db.delete(badges).execute();

	const oldEntities = await ReadBadges();
	const newEntities = FromLegacyBadgeEntities(oldEntities);
	logs.push("Copying badges table with " + oldEntities.length + " rows");

	try {
		await db.insert(badges).values(newEntities).execute();
		logs.push(`Inserted badges`);
	} catch (error: any) {
		logs.push("Error in badges Insert: " + error.message);
	}

	return logs;
}

/**
 * Copy belts table
 */
async function CopyBeltsTable(db: DrizzleType): Promise<string[]> {
	const logs: string[] = [];

	await db.delete(belts).execute();

	const oldEntities = await ReadBelts();
	const newEntities = FromLegacyBeltEntities(oldEntities);
	logs.push("Copying belts table with " + oldEntities.length + " rows");

	try {
		await db.insert(belts).values(newEntities).execute();
		logs.push(`Inserted belts`);
	} catch (error: any) {
		logs.push("Error in belts Insert: " + error.message);
	}

	return logs;
}

/**
 * Copy the members table
 */
async function CopyMembersTable(db: DrizzleType): Promise<string[]> {
	const logs: string[] = [];

	await db.delete(members).execute();

	const oldNinjas = await ReadNinjas();
	const newNinjas = FromLegacyMemberEntities(oldNinjas);

	const oldAdults = await ReadAdults();
	const newAdults = FromLegacyAdultEntities(oldAdults);

	// Copy ninjas one at a time
	// for (const ninja of newNinjas) {
	// 	try {
	// 		await db.insert(members).values(ninja).execute();
	// 		// logs.push(`Inserted ninja ${ninja.id}`);
	// 	} catch (error: any) {
	// 		logs.push(`Error in ninja ${ninja.id}`);
	// 		logs.push(`Insert: ${error.message}`);
	// 		logs.push(JSON.stringify({ ninja }));
	// 		break;
	// 	}
	// }

	// Copy adults one at a time
	// for (const adult of newAdults) {
	// 	try {
	// 		await db.insert(members).values(adult).execute();
	// 		// logs.push(`Inserted ninja ${ninja.id}`);
	// 	} catch (error: any) {
	// 		logs.push(`Error in ninja ${adult.id}`);
	// 		logs.push(`Insert: ${error.message}`);
	// 		logs.push(JSON.stringify({ adult }));
	// 		break;
	// 	}
	// }

	// Copy all ninjas at once
	// logs.push("Copying mebers table with " + oldNinjas.length + " ninjas");
	// try {
	// 	await db.insert(members).values(newNinjas).execute();
	// 	logs.push(`Inserted ninjas`);
	// } catch (error: any) {
	// 	logs.push("Error in ninjas Insert: " + error.message);
	// 	return logs;
	// }

	// Copy all adults at once
	logs.push("Copying mebers table with " + oldAdults.length + " adults");
	try {
		await db.insert(members).values(newAdults).execute();
		logs.push(`Inserted adults`);
	} catch (error: any) {
		logs.push("Error in adults Insert: " + error.message);
	}

	return logs;
}

/**
 * Copy sessions table
 */
async function CopySessionsTable(db: DrizzleType): Promise<string[]> {
	const logs: string[] = [];

	await db.delete(sessions).execute();

	const oldEntities = await ReadSessions();
	const newEntities = FromLegacySessionEntities(oldEntities);
	logs.push("Copying Sessions table with " + oldEntities.length + " rows");
	try {
		await db.insert(sessions).values(newEntities).execute();
		logs.push(`Inserted sessions`);
	} catch (error: any) {
		logs.push("Error in sessions Insert: " + error.message);
	}

	return logs;
}

/**
 * Copy member badges table
 */
async function CopyMemberBadgesTable(db: DrizzleType): Promise<string[]> {
	const logs: string[] = [];

	await db.delete(memberBadges).execute();

	const oldEntities = await ReadMemberBadges();
	const newEntities = FromLegacyMemberBadgeEntities(oldEntities);
	logs.push(
		"Copying Member Badges table with " + oldEntities.length + " rows",
	);
	try {
		await db.insert(memberBadges).values(newEntities).execute();
		logs.push(`Inserted member badges`);
	} catch (error: any) {
		logs.push("Error in member badges Insert: " + error.message);
	}

	return logs;
}

/**
 * Copy member belts table
 */
async function CopyMemberBeltsTable(db: DrizzleType): Promise<string[]> {
	const logs: string[] = [];

	await db.delete(memberBelts).execute();

	const oldEntities = await ReadMemberBelts();
	const newEntities = FromLegacyMemberBeltEntities(oldEntities);
	logs.push(
		"Copying Member Belts table with " + oldEntities.length + " rows",
	);
	try {
		await db.insert(memberBelts).values(newEntities).execute();
		logs.push(`Inserted member belts`);
	} catch (error: any) {
		logs.push("Error in member belts Insert: " + error.message);
	}

	return logs;
}

/**
 * Copy member badge categories table
 */
async function CopyMemberBadgeCategoriesTable(
	db: DrizzleType,
): Promise<string[]> {
	const logs: string[] = [];

	await db.delete(memberBadgeCategories).execute();

	const oldEntities = await ReadAdultBadgeCategories();
	const newEntities = FromLegacyAdultBadgeCategoryEntities(oldEntities);
	logs.push(
		"Copying Member Badge Categories table with " +
			oldEntities.length +
			" rows",
	);
	try {
		await db.insert(memberBadgeCategories).values(newEntities).execute();
		logs.push(`Inserted member badge categories`);
	} catch (error: any) {
		logs.push("Error in member badge categories Insert: " + error.message);
	}

	return logs;
}

/**
 * copy member parents table
 */
async function CopyMemberParentsTable(db: DrizzleType): Promise<string[]> {
	const logs: string[] = [];

	await db.delete(memberParents).execute();

	const oldEntities = await ReadMemberParents();
	const newEntities = FromLegacyMemberParentEntities(oldEntities);
	logs.push(
		"Copying Member Parents table with " + oldEntities.length + " rows",
	);
	try {
		await db.insert(memberParents).values(newEntities).execute();
		logs.push(`Inserted member parents`);
	} catch (error: any) {
		logs.push("Error in member parents Insert: " + error.message);
	}

	return logs;
}

/**
 * Copy the attendance table
 */
async function CopyAttendanceTable(db: DrizzleType): Promise<string[]> {
	const logs: string[] = [];

	await db.delete(memberAttendances).execute();

	const oldMemberEntities = await ReadMemberAttendances();
	let newEntities = FromLegacyMemberAttendanceEntities(oldMemberEntities);
	logs.push(
		"Copying Attendances table with " +
			oldMemberEntities.length +
			" member rows",
	);
	try {
		await db.insert(memberAttendances).values(newEntities).execute();
		logs.push(`Inserted ninja attendances`);
	} catch (error: any) {
		logs.push("Error in ninja attendances Insert: " + error.message);
	}

	const oldAdultEntities = await ReadAdultAttendances();
	newEntities = FromLegacyAdultAttendanceEntities(oldAdultEntities);
	logs.push(
		"Copying Attendances table with " +
			oldAdultEntities.length +
			" adult rows",
	);
	try {
		await db.insert(memberAttendances).values(newEntities).execute();
		logs.push(`Inserted adult attendances`);
	} catch (error: any) {
		logs.push("Error in adult attendances Insert: " + error.message);
	}

	return logs;
}
