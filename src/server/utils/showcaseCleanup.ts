import type { SupabaseClientType } from "#server/db/DatabaseClient";
/** Remove queued obsolete thumbnails, acknowledging only successful storage deletions. */
export async function cleanupShowcaseImages(
	client: SupabaseClientType,
): Promise<void> {
	try {
		const { data, error } = await client
			.schema("coderdojo")
			.rpc("showcase_cleanup_paths");
		if (error || !data?.length) return;
		const paths: string[] = (data as { path: string }[]).map(
			(row: { path: string }): string => row.path,
		);
		const result: Awaited<
			ReturnType<ReturnType<typeof client.storage.from>["remove"]>
		> = await client.storage.from("showcase").remove(paths);
		if (result.error) {
			console.warn("Showcase thumbnail cleanup queued for retry");
			return;
		}
		const acknowledgement = await client
			.schema("coderdojo")
			.rpc("ack_showcase_cleanup", { p_paths: paths });
		if (acknowledgement.error)
			console.warn(
				"Showcase thumbnail cleanup acknowledgement will be retried",
			);
	} catch {
		console.warn("Showcase thumbnail cleanup queued for retry");
	}
}
