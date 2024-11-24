import { createClient, Session, SupabaseClient } from "@supabase/supabase-js";
import { defineEventHandler, readBody, useRuntimeConfig } from "#imports";
import {
	ReadAdults,
	ReadBadgeCategories,
	ReadBadges,
	ReadBelts,
	ReadNinjas,
	ReadTeams,
} from "~~/server/sql/LegacyData";
import { FromLegacyTeamEntities } from "~~/server/sql/Models/LegacyTeamEntity";
import { FromLegacyBadgeCategoryEntities } from "~~/server/sql/Models/LegacyBadgeCategoryEntity";
import { FromLegacyBadgeEntities } from "~~/server/sql/Models/LegacyBadgeEntity";
import { FromLegacyBeltEntities } from "~~/server/sql/Models/LegacyBeltEntity";
import { FromLegacyMemberEntities } from "~~/server/sql/Models/LegacyMemberEntity";
import { FromLegacyAdultEntities } from "~~/server/sql/Models/LegacyAdultEntity";

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
		logs.push(...(await CopyBadgeCategoriesTable(supabase)));
		logs.push(...(await CopyBadgesTable(supabase)));
		logs.push(...(await CopyBeltsTable(supabase)));
		logs.push(...(await CopyMembersTable(supabase)));
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
