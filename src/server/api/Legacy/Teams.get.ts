import { defineEventHandler } from "#imports";
import { ReadLegacyTeams } from "~~/server/sql/LegacyData";
import { ErrorToString } from "~~/shared/utils/ErrorHelpers";
import { useLogger } from "~~/shared/utils/Logger";

type ResponseBody = {
  data: any[];
  logs: string[];
  success: boolean;
};

const log = useLogger("TeamsAPI");

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
    const result = await GetLegacyTeams();
    resp.logs.push(...result.logs);
    resp.data = result.data;
  } catch (error) {
    const errorMsg = `Error in GetLegacyTeams: ${ErrorToString(error)}`;
    log.error(errorMsg);
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
async function GetLegacyTeams(): Promise<{ data: any[]; logs: string[] }> {
  const logs: string[] = [];
  let data: any[] = [];
  try {
    data = await ReadLegacyTeams();
  } catch (error) {
    log.error("Error reading data:", error);
    logs.push(`Error: ${ErrorToString(error)}`);
  }
  return { data, logs };
}
