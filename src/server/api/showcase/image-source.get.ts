import {
	defineEventHandler,
	getQuery,
	createError,
	setResponseHeader,
	type H3Event,
} from "h3";
import { showcaseActor } from "#server/utils/showcase";
import { platformFetch, boundedBytes } from "#server/utils/showcaseRemote";
/** Supply a bounded platform image to the existing client cropper. */
export default defineEventHandler(
	async (event: H3Event): Promise<Uint8Array> => {
		await showcaseActor(event);
		const url: string = String(getQuery(event).url ?? "");
		if (!URL.canParse(url))
			throw createError({ statusCode: 400, statusMessage: "Invalid image" });
		const response: Response = await platformFetch(url, true);
		const contentType: string =
			response.headers.get("content-type")?.split(";")[0] ?? "";
		if (!["image/png", "image/jpeg", "image/webp"].includes(contentType))
			throw createError({
				statusCode: 400,
				statusMessage: "Unsupported image",
			});
		const bytes: Uint8Array = await boundedBytes(response, 8_000_000);
		setResponseHeader(event, "Content-Type", contentType);
		setResponseHeader(event, "Cache-Control", "no-store");
		return bytes;
	},
);
