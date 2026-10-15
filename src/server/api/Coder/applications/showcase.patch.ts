import { defineEventHandler, type H3Event } from "h3";
import { requireRequestCoder } from "#server/utils/coderRequest";
import { maintenanceBody } from "#server/utils/maintenanceRequest";
import {
	applicationShowcaseSchema,
	applicationResultSchema,
	type ApplicationShowcase,
	type ApplicationResult,
} from "#shared/types/Coder";
import { coderAction } from "#server/db/CoderActionsData";
/** Replace links only on the coder's unchanged pending application. */
export default defineEventHandler(
	async (event: H3Event): Promise<ApplicationResult> => {
		const actor: Awaited<ReturnType<typeof requireRequestCoder>> =
			await requireRequestCoder(event);
		const body: ApplicationShowcase = await maintenanceBody(
			event,
			applicationShowcaseSchema,
		);
		return applicationResultSchema.parse(
			await coderAction(
				actor,
				"application-showcase",
				body.kind,
				body.id,
				{ showcaseItemIds: body.showcaseItemIds },
				{ showcaseItemIds: body.expectedShowcaseItemIds },
			),
		);
	},
);
