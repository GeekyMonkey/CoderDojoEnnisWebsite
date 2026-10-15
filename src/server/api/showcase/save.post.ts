import { cleanupShowcaseImages } from "#server/utils/showcaseCleanup";
import { defineEventHandler, readBody, createError, type H3Event } from "h3";
import { z } from "zod";
import {
	showcaseFieldsSchema,
	type ShowcaseItem,
} from "#shared/types/Showcase";
import {
	showcaseActor,
	showcaseItem,
	showcaseFailure,
	type ShowcaseRow,
} from "#server/utils/showcase";
import {
	validateGithubSite,
	verifyScratchProject,
} from "#server/utils/showcaseRemote";
import { validateProfilePng } from "#server/utils/profilePng";
const saveSchema = z.strictObject({
	id: z.uuid().nullable(),
	expectedUpdatedAt: z.string().nullable(),
	fields: showcaseFieldsSchema,
	png: z.string().max(4_000_000).nullable().optional(),
	removeImage: z.boolean().optional(),
});
/** Save an authorized entry and immutable thumbnail, enforcing publication and revision checks. */
export default defineEventHandler(
	async (event: H3Event): Promise<ShowcaseItem> => {
		const { actor, owner } = await showcaseActor(event);
		const parsed = saveSchema.safeParse(await readBody<unknown>(event));
		if (!parsed.success)
			throw createError({
				statusCode: 400,
				statusMessage: "Check the showcase fields and public project URL",
			});
		const input = parsed.data;
		const fields = input.fields;
		const id: string = input.id ?? crypto.randomUUID();
		const db = actor.readClient.schema("coderdojo");
		const { data: before, error: readError } = await db
			.from("member_showcase")
			.select("*")
			.eq("id", id)
			.maybeSingle();
		if (readError) showcaseFailure(readError);
		if (input.id && (!before || before.member_id !== owner.id))
			throw createError({
				statusCode: 404,
				statusMessage: "Showcase entry not found",
			});
		if (before && before.updated_at !== input.expectedUpdatedAt)
			throw createError({
				statusCode: 409,
				statusMessage: "This entry changed. Reload before saving.",
			});
		let url: string = fields.url;
		if (fields.projectType === "scratch") {
			const projectId: string =
				new URL(url).pathname.match(/^\/projects\/(\d+)\/?$/)?.[1] ?? "";
			if (
				!projectId ||
				new URL(url).hostname !== "scratch.mit.edu" ||
				!owner.scratch_name
			)
				throw createError({
					statusCode: 400,
					statusMessage: "Choose a shared project from your Scratch account",
				});
			await verifyScratchProject(owner.scratch_name, projectId);
			fields.sourceProjectId = projectId;
			url = `https://scratch.mit.edu/projects/${projectId}/`;
		}
		if (
			fields.projectType === "itch" &&
			!/^[a-z\d-]+\.itch\.io$/.test(new URL(url).hostname)
		)
			throw createError({
				statusCode: 400,
				statusMessage: "Enter a public itch.io project URL",
			});
		if (fields.projectType === "github_profile")
			url = fields.isVisible
				? await validateGithubSite(owner.github_login)
				: owner.github_login
					? `https://${owner.github_login.toLowerCase()}.github.io/`
					: "";
		let thumbnailVersion: number = before?.thumbnail_version ?? 0;
		if (input.png) {
			const { data: reservedVersion, error: reservationError } = await db.rpc(
				"reserve_showcase_thumbnail_version",
				{ p_id: id, p_member: owner.id },
			);
			if (reservationError) showcaseFailure(reservationError);
			thumbnailVersion = Number(reservedVersion);
			if (!Number.isSafeInteger(thumbnailVersion) || thumbnailVersion < 1)
				showcaseFailure(new Error("Invalid thumbnail version"));
		}
		const path: string | null = input.png
			? `${id}-ver${thumbnailVersion}.png`
			: input.removeImage
				? null
				: (before?.thumbnail_path ?? null);
		if (input.png) {
			const png = validateProfilePng(input.png);
			const { error } = await actor.client.storage
				.from("showcase")
				.upload(path!, png, {
					contentType: "image/png",
					upsert: false,
					cacheControl: "0",
				});
			if (error) showcaseFailure(error);
		}
		const values = {
			member_id: owner.id,
			title: fields.title,
			description: fields.description,
			project_type: fields.projectType,
			url: url || null,
			showcase_date: fields.showcaseDate,
			is_visible: fields.isVisible,
			source_project_id: fields.sourceProjectId,
			thumbnail_path: path,
			thumbnail_version: thumbnailVersion,
		};
		let created: boolean = false;
		try {
			if (!before) {
				const { error } = await db.from("member_showcase").insert({
					...values,
					id,
					is_visible:
						fields.projectType === "github_profile" ? false : fields.isVisible,
				});
				if (error) showcaseFailure(error);
				created = true;
			}
			if (fields.projectType === "github_profile" && fields.isVisible) {
				const { error } = await actor.client
					.schema("coderdojo")
					.rpc("record_showcase_validation", {
						p_id: id,
						p_username: owner.github_login,
						p_url: url,
					});
				if (error) showcaseFailure(error);
			}
			let query = db
				.from("member_showcase")
				.update(values)
				.eq("id", id)
				.eq("member_id", owner.id);
			if (before) query = query.eq("updated_at", input.expectedUpdatedAt);
			const { data, error } = await query.select("*").maybeSingle();
			if (error) showcaseFailure(error);
			if (!data)
				throw createError({
					statusCode: 409,
					statusMessage: "Entry changed; reload and retry",
				});
			await cleanupShowcaseImages(actor.client);
			return showcaseItem(actor.client, data as ShowcaseRow, owner);
		} catch (error: unknown) {
			if (created) await db.from("member_showcase").delete().eq("id", id);
			if (input.png && path)
				await actor.client.storage.from("showcase").remove([path]);
			throw error;
		}
	},
);
