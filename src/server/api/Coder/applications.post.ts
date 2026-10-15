import { defineEventHandler, type H3Event } from "h3";
import { requireRequestCoder } from "#server/utils/coderRequest";
import { maintenanceBody } from "#server/utils/maintenanceRequest";
import {
	coderApplicationSchema,
	applicationResultSchema,
	type CoderApplication,
	type ApplicationResult,
} from "#shared/types/Coder";
import { coderAction } from "#server/db/CoderActionsData";
/** Submit own-coder evidence while preventing duplicates and skipping belt progression. */
export default defineEventHandler(
	async (event: H3Event): Promise<ApplicationResult> => {
		const actor: Awaited<ReturnType<typeof requireRequestCoder>> =
			await requireRequestCoder(event);
		const body: CoderApplication = await maintenanceBody(
			event,
			coderApplicationSchema,
		);
		return applicationResultSchema.parse(
			await coderAction(actor, "apply", body.kind, body.definitionId, {
				notes: body.notes,
				showcaseItemIds: body.showcaseItemIds,
			}),
		);
	},
);
