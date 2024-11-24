import { createClient, Session, SupabaseClient } from "@supabase/supabase-js";
import { defineEventHandler, readBody, useRuntimeConfig } from "#imports";
import {
	ReadBadgeCategories,
	ReadBadges,
	ReadTeams,
} from "~~/server/sql/LegacyData";
import { FromLegacyTeamEntities } from "~~/server/sql/Models/LegacyTeamEntity";
import { FromLegacyBadgeCategoryEntities } from "~~/server/sql/Models/LegacyBadgeCategoryEntity";
import { FromLegacyBadgeEntities } from "~~/server/sql/Models/LegacyBadgeEntity";

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
