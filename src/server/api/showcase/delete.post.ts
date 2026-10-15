import { cleanupShowcaseImages } from "#server/utils/showcaseCleanup";
import { defineEventHandler, readBody, createError, type H3Event } from "h3";
import { z } from "zod";
import { showcaseActor, showcaseFailure } from "#server/utils/showcase";
const deleteSchema = z.strictObject({
	id: z.uuid(),
	expectedUpdatedAt: z.string(),
});
/** Delete only the selected revision and clean its thumbnail after success. */
export default defineEventHandler(
	async (event: H3Event): Promise<{ success: true }> => {
		const { actor, owner } = await showcaseActor(event);
		const parsed = deleteSchema.safeParse(await readBody<unknown>(event));
		if (!parsed.success)
			throw createError({
				statusCode: 400,
				statusMessage: "Invalid showcase entry",
			});
		const { data, error } = await actor.readClient
			.schema("coderdojo")
			.from("member_showcase")
			.delete()
			.eq("id", parsed.data.id)
			.eq("member_id", owner.id)
			.eq("updated_at", parsed.data.expectedUpdatedAt)
			.select("thumbnail_path")
			.maybeSingle();
		if (error) showcaseFailure(error);
		if (!data)
			throw createError({
				statusCode: 409,
				statusMessage: "Entry changed or unavailable; reload and retry",
			});
		await cleanupShowcaseImages(actor.client);
		return { success: true };
	},
);
