import { defineEventHandler } from "#imports";
import { ReadLegacyTeams } from "~~/server/sql/LegacyData";

type ResponseBody = {
	data: any[];
	logs: string[];
	success: boolean;
};

/**
 * GET: api/Legacy/Teams
 */
export default defineEventHandler(async (event): Promise<ResponseBody> => {
	const resp: ResponseBody = {
		data: [],
		logs: [],
		success: false,
	};

	try {
		const result = (await GetLegacyTeams());
		resp.logs.push(...result.logs);
		resp.data = result.data;
	} catch (error: any) {
		const errorMsg = "Error in GetLegacyTeams: " + error.message;
		console.error(errorMsg);
		resp.logs.push(errorMsg);
	}

	return {
		...resp,
		success: !resp.logs.find((e) => e.toLowerCase().startsWith("error")),
	};
});

/**
 * Get legacy teams
 */
async function GetLegacyTeams(
): Promise<{ data: any[], logs: string[] }> {
	const logs: string[] = [];
	let data: any[] = []; 
	try {
		data = await ReadLegacyTeams();
	} catch (error: any) {
		console.error("Error reading data:", error);
		logs.push("Error: " + error.message);
	}
	return { data, logs };
}

