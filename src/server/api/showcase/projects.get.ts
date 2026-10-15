import { defineEventHandler, getQuery, createError, type H3Event } from "h3";
import { showcaseActor } from "#server/utils/showcase";
import { scratchProjects, itchProject } from "#server/utils/showcaseRemote";
import type { ProjectPreview } from "#shared/types/Showcase";
/** Discover public project metadata for the authorized editor through store actions. */
export default defineEventHandler(
	async (event: H3Event): Promise<ProjectPreview[]> => {
		const { owner } = await showcaseActor(event);
		const query = getQuery(event);
		if (query.projectType === "scratch")
			return scratchProjects(
				owner.scratch_name ?? "",
				Math.max(0, Math.min(100000, Number(query.offset) || 0)),
			);
		if (
			query.projectType === "itch" &&
			typeof query.url === "string" &&
			URL.canParse(query.url)
		)
			return [await itchProject(query.url)];
		throw createError({
			statusCode: 400,
			statusMessage: "Choose Scratch or enter an itch.io project URL",
		});
	},
);
