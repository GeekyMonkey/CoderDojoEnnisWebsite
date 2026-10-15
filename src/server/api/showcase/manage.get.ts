import { cleanupShowcaseImages } from "#server/utils/showcaseCleanup";
import { defineEventHandler, setResponseHeader, type H3Event } from "h3";
import {
	showcaseActor,
	showcaseItem,
	showcaseRows,
	type ShowcaseRow,
} from "#server/utils/showcase";
import type { ShowcaseContext } from "#shared/types/Showcase";
/** List a permitted member's entries and linked account setup context. */
export default defineEventHandler(
	async (event: H3Event): Promise<ShowcaseContext> => {
		setResponseHeader(event, "Cache-Control", "no-store");
		const { actor, owner } = await showcaseActor(event);
		await cleanupShowcaseImages(actor.client);
		const data: ShowcaseRow[] = await showcaseRows(actor.client, owner.id);
		return {
			memberId: owner.id,
			scratchName: owner.scratch_name,
			githubLogin: owner.github_login,
			profileUrl:
				owner.id === actor.id
					? `/${actor.member.isMentor ? "mentor" : actor.member.isParent ? "parent" : "coder"}/profile`
					: actor.member.isMentor
						? `/mentor/member/${owner.id}`
						: `/parent/kids/${owner.id}/account`,
			items: (data as ShowcaseRow[]).map((row: ShowcaseRow) =>
				showcaseItem(actor.client, row, owner),
			),
		};
	},
);
