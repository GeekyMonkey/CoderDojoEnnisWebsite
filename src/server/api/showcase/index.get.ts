import { cleanupShowcaseImages } from "#server/utils/showcaseCleanup";
import { defineEventHandler, setResponseHeader, type H3Event } from "h3";
import {
	showcaseClient,
	showcaseItem,
	showcaseFailure,
	showcaseRows,
	type ShowcaseOwner,
	type ShowcaseRow,
} from "#server/utils/showcase";
import type { ShowcaseItem } from "#shared/types/Showcase";
/** Return only eligible public cards; no stale public caching. */
export default defineEventHandler(
	async (event: H3Event): Promise<ShowcaseItem[]> => {
		setResponseHeader(event, "Cache-Control", "no-store");
		const client = await showcaseClient(event);
		await cleanupShowcaseImages(client);
		const rows: ShowcaseRow[] = await showcaseRows(client);
		const ids: string[] = [
			...new Set(
				(rows as ShowcaseRow[]).map(
					(row: ShowcaseRow): string => row.member_id,
				),
			),
		];
		if (!ids.length) return [];
		const byId: Map<string, ShowcaseOwner> = new Map();
		for (let offset: number = 0; offset < ids.length; offset += 500) {
			const { data: owners, error: ownerError } = await client
				.schema("coderdojo")
				.from("members")
				.select(
					"id,name_first,name_last,login,has_avatar,has_photo,is_ninja,is_parent,is_mentor,deleted",
				)
				.in("id", ids.slice(offset, offset + 500))
				.eq("deleted", false);
			if (ownerError) showcaseFailure(ownerError);
			for (const owner of owners as ShowcaseOwner[]) byId.set(owner.id, owner);
		}
		return (rows as ShowcaseRow[]).flatMap(
			(row: ShowcaseRow): ShowcaseItem[] => {
				const owner: ShowcaseOwner | undefined = byId.get(row.member_id);
				return owner ? [showcaseItem(client, row, owner)] : [];
			},
		);
	},
);
