import { createError } from "h3";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import type { VerifiedMember } from "#server/utils/requestMember";
import { dataMaintenanceReportSchema, type DataMaintenanceAction, type DataMaintenanceReport } from "#shared/types/DataMaintenance";

/** Preview or atomically apply a mentor-confirmed maintenance snapshot. */
export async function maintainData(actor: VerifiedMember, action: DataMaintenanceAction, revision: string | null = null): Promise<DataMaintenanceReport> {
 const { data, error }: PostgrestSingleResponse<unknown> = await actor.client.schema("coderdojo").rpc("maintain_data", {
  p_actor: actor.id, p_action: action, p_apply: revision !== null, p_expected: revision,
 });
 if (error) {
  const status: number = error.code === "42501" ? 403 : error.code === "P0001" ? 409 : error.code === "22023" ? 400 : 503;
  throw createError({ statusCode: status, statusMessage: status === 503 ? "Unable to run data maintenance" : error.message });
 }
 return dataMaintenanceReportSchema.parse(data);
}
