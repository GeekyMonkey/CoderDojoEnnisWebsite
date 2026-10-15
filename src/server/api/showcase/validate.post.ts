import { defineEventHandler, type H3Event } from "h3";
import { showcaseActor } from "#server/utils/showcase";
import { validateGithubSite } from "#server/utils/showcaseRemote";
/** Check the target member's public Pages site; saving rechecks before publication. */
export default defineEventHandler(
	async (event: H3Event): Promise<{ url: string }> => {
		const { owner } = await showcaseActor(event);
		return { url: await validateGithubSite(owner.github_login) };
	},
);
