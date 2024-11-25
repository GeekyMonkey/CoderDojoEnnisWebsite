import { createClient, Session, SupabaseClient } from "@supabase/supabase-js";
import { defineEventHandler, readBody, useRuntimeConfig } from "#imports";
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
import { DB } from "~~/server/db";
import { teams as teamsTable } from "~~/server/db/schema/schemas";

// Define interfaces for the request body and query parameters
type RequestBody = {};

type ResponseBody = {
	logs: string[];
	success: boolean;
};

type SupabaseClientType = SupabaseClient<any, "coderdojo", any>;

export default defineEventHandler(async (event): Promise<ResponseBody> => {
	const { req } = event.node;

	// Access request body
	const body: RequestBody = await readBody(event);
	const resp: ResponseBody = {
		logs: [],
		success: false,
	};

	resp.logs.push(...(await CopyData(resp)));

	return {
		...resp,
		success: !resp.logs.find((e) => e.toLowerCase().startsWith("error")),
	};
});

async function CopyData(resp: ResponseBody): Promise<string[]> {
	const logs: string[] = [];
	try {
		// Get Supabase configuration from runtime config
		const config = useRuntimeConfig();
		const supabaseUrl = config.public.supabase.url;
		const supabaseServiceRoleKey = config.private.supabase.password;

		// Create Supabase client with schema specified
		const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
			db: {
				schema: "coderdojo",
			},
		});
		logs.push("Supabase client created");

		logs.push(...(await CopyTeamsTable(supabase)));
		// logs.push(...(await CopyBadgeCategoriesTable(supabase)));
		// logs.push(...(await CopyBadgesTable(supabase)));
		// logs.push(...(await CopyBeltsTable(supabase)));
		// logs.push(...(await CopyMembersTable(supabase)));
		// logs.push(...(await CopySessionsTable(supabase)));
		// logs.push(...(await CopyAttendanceTable(supabase)));
		// logs.push(...(await CopyMemberBadgeCategoriesTable(supabase)));
		// logs.push(...(await CopyMemberParentsTable(supabase)));
		// logs.push(...(await CopyMemberBadgesTable(supabase)));
		// logs.push(...(await CopyMemberBeltsTable(supabase)));
	} catch (error: any) {
		console.error("Error copying data:", error);
		logs.push("Error: " + error.message);
	}
	return logs;
}

/**
 * Purge a table
 */
async function PurgeTable(
	supabase: SupabaseClientType,
	tableName: string,
): Promise<string[]> {
	const logs: string[] = [];

	logs.push(`Purging ${tableName} table`);
	const { data: deleteData, error: deleteError } = await supabase
		.from(tableName)
		.delete()
		.not("id", "is", "null");
	if (deleteError) {
		logs.push(`Error in ${tableName} Purge: ` + deleteError.message);
		return logs;
	}
	return logs;
}

async function CopyTeamsTable(supabase: SupabaseClientType): Promise<string[]> {
	const logs: string[] = [];

	logs.push(...(await PurgeTable(supabase, "teams")));
	const teams = await ReadTeams();
	const newTeams = FromLegacyTeamEntities(teams);
	logs.push("Copying teams table with " + teams.length + " rows");
	const { data: insertData, error: insertError } = await supabase
		.from("teams")
		.insert(newTeams);

	if (insertError) {
		logs.push("Error in Teams Insert: " + insertError.message);
	} else {
		logs.push(`Inserted teams`);
	}

	return logs;
}

async function CopyBadgeCategoriesTable(
	supabase: SupabaseClientType,
): Promise<string[]> {
	const logs: string[] = [];

	logs.push(...(await PurgeTable(supabase, "badge_categories")));
	const oldEntities = await ReadBadgeCategories();
	const newEntities = FromLegacyBadgeCategoryEntities(oldEntities);
	logs.push(
		"Copying badge cateogires table with " + oldEntities.length + " rows",
	);
	const { data: insertData, error: insertError } = await supabase
		.from("badge_categories")
		.insert(newEntities);

	if (insertError) {
		logs.push("Error in badge categories Insert: " + insertError.message);
	} else {
		logs.push(`Inserted badge categories`);
	}

	return logs;
}

async function CopyBadgesTable(
	supabase: SupabaseClientType,
): Promise<string[]> {
	const logs: string[] = [];

	logs.push(...(await PurgeTable(supabase, "badges")));
	const oldEntities = await ReadBadges();
	const newEntities = FromLegacyBadgeEntities(oldEntities);
	logs.push("Copying badges table with " + oldEntities.length + " rows");
	const { data: insertData, error: insertError } = await supabase
		.from("badges")
		.insert(newEntities);

	if (insertError) {
		logs.push("Error in badge Insert: " + insertError.message);
	} else {
		logs.push(`Inserted badges`);
	}

	return logs;
}

async function CopyBeltsTable(supabase: SupabaseClientType): Promise<string[]> {
	const logs: string[] = [];

	logs.push(...(await PurgeTable(supabase, "belts")));
	const oldEntities = await ReadBelts();
	const newEntities = FromLegacyBeltEntities(oldEntities);
	logs.push("Copying belts table with " + oldEntities.length + " rows");
	const { data: insertData, error: insertError } = await supabase
		.from("belts")
		.insert(newEntities);

	if (insertError) {
		logs.push("Error in belts Insert: " + insertError.message);
	} else {
		logs.push(`Inserted belts`);
	}

	return logs;
}

async function CopyMembersTable(
	supabase: SupabaseClientType,
): Promise<string[]> {
	const logs: string[] = [];

	logs.push(...(await PurgeTable(supabase, "members")));

	const oldNinjas = await ReadNinjas();
	const newNinjas = FromLegacyMemberEntities(oldNinjas);

	// Copy all at once
	logs.push("Copying mebers table with " + oldNinjas.length + " ninjas");
	const { data: insertNinjaData, error: insertNinjaError } = await supabase
		.from("members")
		.insert(newNinjas);
	if (insertNinjaError) {
		logs.push("Error in ninja Insert: " + insertNinjaError.message);
	} else {
		logs.push(`Inserted ninjas`);
	}

	// Copy one at a time
	// let ninjaError: boolean = false;
	// logs.push("Copying mebers table with " + oldNinjas.length + " ninjas");
	// for (const ninja of newNinjas) {
	// 	const { data: insertNinjaData, error: insertNinjaError } =
	// 		await supabase.from("members").insert(ninja);
	// 	if (insertNinjaError) {
	// 		logs.push(
	// 			"Error in ninja Insert: " +
	// 				insertNinjaError.message +
	// 				" for " +
	// 				JSON.stringify(ninja),
	// 		);
	// 		ninjaError = true;
	// 		break;
	// 	}
	// }
	// if (!ninjaError) {
	// 	logs.push(`Inserted ninjas`);
	// }

	const oldAdults = await ReadAdults();
	const newAdults = FromLegacyAdultEntities(oldAdults);
	logs.push("Copying mebers table with " + oldAdults.length + " adults");

	// Copy all at once
	const { data: insertAdultData, error: insertAdultError } = await supabase
		.from("members")
		.insert(newAdults);
	if (insertAdultError) {
		logs.push("Error in adult Insert: " + insertAdultError.message);
	} else {
		logs.push(`Inserted adults`);
	}

	// Copy one at a time
	// let adultError: boolean = false;
	// for (const adult of newAdults) {
	// 	if (adult.id !== "5589A0CC-CA2D-415F-91FE-9EAAB56D4D65") {
	// 		// todo - remove this
	// 		continue;
	// 	}

	// 	const { data: insertAdultData, error: insertAdultError } =
	// 		await supabase.from("members").insert(adult);
	// 	if (insertAdultError) {
	// 		logs.push(
	// 			"Error in adult Insert: " +
	// 				insertAdultError.message +
	// 				" for " +
	// 				JSON.stringify(adult),
	// 		);
	// 		adultError = true;
	// 		break;
	// 	}
	// }
	// if (!adultError) {
	// 	logs.push(`Inserted adults`);
	// }

	return logs;
}

async function CopySessionsTable(
	supabase: SupabaseClientType,
): Promise<string[]> {
	const logs: string[] = [];

	logs.push(...(await PurgeTable(supabase, "sessions")));
	const oldEntities = await ReadSessions();
	const newEntities = FromLegacySessionEntities(oldEntities);
	logs.push("Copying Sessions table with " + oldEntities.length + " rows");
	const { data: insertData, error: insertError } = await supabase
		.from("sessions")
		.insert(newEntities);

	if (insertError) {
		logs.push("Error in Sessions Insert: " + insertError.message);
	} else {
		logs.push(`Inserted Sessions`);
	}

	return logs;
}

async function CopyMemberBadgesTable(
	supabase: SupabaseClientType,
): Promise<string[]> {
	const logs: string[] = [];

	logs.push(...(await PurgeTable(supabase, "member_badges")));

	const oldEntities = await ReadMemberBadges();
	const newEntities = FromLegacyMemberBadgeEntities(oldEntities);
	logs.push(
		"Copying Member Badges table with " + oldEntities.length + " rows",
	);
	const { data: insertData, error: insertError } = await supabase
		.from("member_badges")
		.insert(newEntities);

	if (insertError) {
		logs.push("Error in Member Badges Insert: " + insertError.message);
	} else {
		logs.push(`Inserted Member Badges`);
	}

	return logs;
}

async function CopyMemberBeltsTable(
	supabase: SupabaseClientType,
): Promise<string[]> {
	const logs: string[] = [];

	logs.push(...(await PurgeTable(supabase, "member_belts")));

	const oldEntities = await ReadMemberBelts();
	const newEntities = FromLegacyMemberBeltEntities(oldEntities);
	logs.push(
		"Copying Member Belts table with " + oldEntities.length + " rows",
	);
	const { data: insertData, error: insertError } = await supabase
		.from("member_belts")
		.insert(newEntities);

	if (insertError) {
		logs.push("Error in Member Belts Insert: " + insertError.message);
	} else {
		logs.push(`Inserted Member Belts`);
	}

	return logs;
}

async function CopyMemberBadgeCategoriesTable(
	supabase: SupabaseClientType,
): Promise<string[]> {
	const logs: string[] = [];

	logs.push(...(await PurgeTable(supabase, "member_badge_categories")));

	const oldEntities = await ReadAdultBadgeCategories();
	const newEntities = FromLegacyAdultBadgeCategoryEntities(oldEntities);
	logs.push(
		"Copying Member Badge Categories table with " +
			oldEntities.length +
			" rows",
	);
	const { data: insertData, error: insertError } = await supabase
		.from("member_badge_categories")
		.insert(newEntities);

	if (insertError) {
		logs.push(
			"Error in Member Badge Categories Insert: " + insertError.message,
		);
	} else {
		logs.push(`Inserted Member Badge Categories`);
	}

	return logs;
}

async function CopyMemberParentsTable(
	supabase: SupabaseClientType,
): Promise<string[]> {
	const logs: string[] = [];

	logs.push(...(await PurgeTable(supabase, "member_parents")));

	const oldEntities = await ReadMemberParents();
	const newEntities = FromLegacyMemberParentEntities(oldEntities);
	logs.push(
		"Copying Member Parents table with " + oldEntities.length + " rows",
	);
	const { data: insertData, error: insertError } = await supabase
		.from("member_parents")
		.insert(newEntities);

	if (insertError) {
		logs.push("Error in Member Parents Insert: " + insertError.message);
	} else {
		logs.push(`Inserted Member Parents`);
	}

	return logs;
}

async function CopyAttendanceTable(
	supabase: SupabaseClientType,
): Promise<string[]> {
	const logs: string[] = [];

	logs.push(...(await PurgeTable(supabase, "member_attendances")));

	const oldMemberEntities = await ReadMemberAttendances();
	let newEntities = FromLegacyMemberAttendanceEntities(oldMemberEntities);
	logs.push(
		"Copying Attendances table with " +
			oldMemberEntities.length +
			" member rows",
	);
	const { data: insertMemberData, error: insertMemberError } = await supabase
		.from("member_attendances")
		.insert(newEntities);
	if (insertMemberError) {
		logs.push(
			"Error in Member Attendances Insert: " + insertMemberError.message,
		);
	} else {
		logs.push(`Inserted Member Attendances`);
	}

	const oldAdultEntities = await ReadAdultAttendances();
	newEntities = FromLegacyAdultAttendanceEntities(oldAdultEntities);
	logs.push(
		"Copying Attendances table with " +
			oldAdultEntities.length +
			" member rows",
	);
	const { data: insertAdultData, error: insertAdultError } = await supabase
		.from("member_attendances")
		.insert(newEntities);
	if (insertAdultError) {
		logs.push(
			"Error in Adult Attendances Insert: " + insertAdultError.message,
		);
	} else {
		logs.push(`Inserted Adult Attendances`);
	}

	return logs;
}
