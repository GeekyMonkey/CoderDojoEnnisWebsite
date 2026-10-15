import { createError } from "h3";
import type { ProjectPreview } from "#shared/types/Showcase";

const IMAGE_HOSTS: Set<string> = new Set([
	"uploads.scratch.mit.edu",
	"cdn2.scratch.mit.edu",
	"img.itch.zone",
	"img.itch.io",
]);
/** Fetch bounded platform resources without following arbitrary redirects. */
export async function platformFetch(
	url: string,
	image: boolean = false,
	followRedirects: boolean = true,
): Promise<Response> {
	let target: URL = new URL(url);
	for (let hop: number = 0; hop < 4; hop++) {
		const host: string = target.hostname.toLowerCase();
		const allowed: boolean = image
			? IMAGE_HOSTS.has(host)
			: host === "api.scratch.mit.edu" ||
				host === "api.github.com" ||
				/^[a-z\d](?:[a-z\d-]*[a-z\d])?\.(?:itch\.io|github\.io)$/.test(host);
		if (
			!allowed ||
			target.protocol !== "https:" ||
			target.port ||
			target.username ||
			target.password
		)
			throw createError({
				statusCode: 400,
				statusMessage: "Unsupported project address",
			});
		const response: Response = await fetch(target, {
			redirect: "manual",
			signal: AbortSignal.timeout(10000),
			headers: {
				"User-Agent": "CoderDojoEnnis-Showcase",
				Accept: image
					? "image/png,image/jpeg,image/webp"
					: "application/json,text/html",
			},
		});
		if (
			[301, 302, 303, 307, 308].includes(response.status) &&
			response.headers.get("location")
		) {
			if (!followRedirects) return response;
			target = new URL(response.headers.get("location")!, target);
			continue;
		}
		return response;
	}
	throw createError({
		statusCode: 400,
		statusMessage: "Too many project redirects",
	});
}
/** Read a resource with a hard stream-size limit. */
export async function boundedBytes(
	response: Response,
	limit: number,
): Promise<Uint8Array> {
	if (!response.ok)
		throw createError({
			statusCode: 502,
			statusMessage: "Project service unavailable; check the address and retry",
		});
	const reader: ReadableStreamDefaultReader<Uint8Array> | undefined =
		response.body?.getReader();
	if (!reader)
		throw createError({
			statusCode: 502,
			statusMessage: "Empty project response",
		});
	const chunks: Uint8Array[] = [];
	let total: number = 0;
	try {
		while (true) {
			const part: ReadableStreamReadResult<Uint8Array> = await reader.read();
			if (part.done) break;
			total += part.value.length;
			if (total > limit)
				throw createError({
					statusCode: 413,
					statusMessage: "Project resource is too large",
				});
			chunks.push(part.value);
		}
	} finally {
		await reader.cancel();
	}
	const bytes: Uint8Array = new Uint8Array(total);
	let offset: number = 0;
	for (const chunk of chunks) {
		bytes.set(chunk, offset);
		offset += chunk.length;
	}
	return bytes;
}
/** Resolve Scratch's numeric identity when project author records omit usernames. */
async function scratchAccountId(username: string): Promise<number> {
	if (!/^[\w-]{1,30}$/.test(username))
		throw createError({
			statusCode: 400,
			statusMessage: "Set a valid Scratch username in your profile",
		});
	const response: Response = await platformFetch(
		`https://api.scratch.mit.edu/users/${encodeURIComponent(username)}`,
	);
	const account: { id?: number } = JSON.parse(
		new TextDecoder().decode(await boundedBytes(response, 100_000)),
	);
	if (!Number.isSafeInteger(account.id) || !account.id || account.id < 1)
		throw createError({
			statusCode: 502,
			statusMessage: "Unable to verify the Scratch account",
		});
	return account.id;
}
/** Verify selected project ownership using the authoritative numeric Scratch account ID. */
export async function verifyScratchProject(
	username: string,
	projectId: string,
): Promise<void> {
	if (!/^\d+$/.test(projectId))
		throw createError({
			statusCode: 400,
			statusMessage: "Invalid Scratch project",
		});
	const accountId: number = await scratchAccountId(username);
	const response: Response = await platformFetch(
		`https://api.scratch.mit.edu/users/${encodeURIComponent(username)}/projects/${projectId}`,
	);
	const project: {
		author?: { id?: number };
		public?: boolean;
		is_published?: boolean;
	} = JSON.parse(
		new TextDecoder().decode(await boundedBytes(response, 2_000_000)),
	);
	if (
		project.author?.id !== accountId ||
		project.public === false ||
		project.is_published === false
	)
		throw createError({
			statusCode: 400,
			statusMessage:
				"Choose a public project belonging to your Scratch account",
		});
}
/** Retrieve public Scratch projects for the saved member handle. */
export async function scratchProjects(
	username: string,
	offset: number,
): Promise<ProjectPreview[]> {
	if (!/^[\w-]{1,30}$/.test(username))
		throw createError({
			statusCode: 400,
			statusMessage: "Set a valid Scratch username in your profile",
		});
	const response: Response = await platformFetch(
		`https://api.scratch.mit.edu/users/${encodeURIComponent(username)}/projects?limit=40&offset=${offset}`,
	);
	const data: unknown = JSON.parse(
		new TextDecoder().decode(await boundedBytes(response, 2_000_000)),
	);
	if (!Array.isArray(data))
		throw createError({
			statusCode: 502,
			statusMessage: "Unable to load Scratch projects",
		});
	const accountId: number | null = data.some(
		(item): boolean => typeof item.author?.username !== "string",
	)
		? await scratchAccountId(username)
		: null;
	return data
		.filter(
			(item): boolean =>
				item.public !== false &&
				item.is_published !== false &&
				(typeof item.author?.username === "string"
					? item.author.username.toLowerCase() === username.toLowerCase()
					: accountId !== null && item.author?.id === accountId),
		)
		.map(
			(item): ProjectPreview => ({
				sourceProjectId: String(item.id),
				title: String(item.title ?? ""),
				description: String(item.description || item.instructions || ""),
				url: `https://scratch.mit.edu/projects/${item.id}/`,
				imageUrl:
					typeof item.image === "string"
						? item.image.replace(/^http:/, "https:")
						: null,
			}),
		);
}
/** Decode common HTML entities in plain imported text. */
function plain(value: string): string {
	return value
		.replace(/<[^>]*>/g, "")
		.replace(/&quot;/g, '"')
		.replace(/&#39;|&apos;/g, "'")
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&#(\d+);/g, (_match: string, code: string): string =>
			String.fromCodePoint(Math.min(Number(code), 0x10ffff)),
		)
		.trim();
}
/** Resolve a public itch.io project without account credentials. */
export async function itchProject(url: string): Promise<ProjectPreview> {
	const address: URL = new URL(url);
	if (
		!/^[a-z\d-]+\.itch\.io$/.test(address.hostname) ||
		address.pathname === "/"
	)
		throw createError({
			statusCode: 400,
			statusMessage: "Enter an itch.io project URL",
		});
	const html: string = new TextDecoder().decode(
		await boundedBytes(await platformFetch(url), 2_000_000),
	);
	const metadata: Record<string, string> = {};
	for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
		const attrs: Record<string, string> = {};
		for (const attr of match[0].matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/gs))
			attrs[attr[1]!.toLowerCase()] = attr[3]!;
		if (attrs.property || attrs.name)
			metadata[attrs.property ?? attrs.name!] = plain(attrs.content ?? "");
	}
	return {
		sourceProjectId: metadata["itch:game:id"] || address.pathname,
		title:
			metadata["og:title"] ||
			metadata["twitter:title"] ||
			plain(html.match(/<title>(.*?)<\/title>/is)?.[1] ?? ""),
		description:
			metadata["og:description"] ||
			metadata["twitter:description"] ||
			metadata.description ||
			"",
		url: address.origin + address.pathname,
		imageUrl: metadata["og:image"] || metadata["twitter:image"] || null,
	};
}
/** Confirm a real published GitHub user site before enabling visibility. */
export async function validateGithubSite(
	username: string | null,
): Promise<string> {
	if (!username || !/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(username))
		throw createError({
			statusCode: 400,
			statusMessage: "Add your GitHub username in your club profile first",
		});
	const url: string = `https://${username.toLowerCase()}.github.io/`;
	const response: Response = await platformFetch(url, false, false);
	if ([301, 302, 303, 307, 308].includes(response.status)) {
		const destination: URL = new URL(
			response.headers.get("location") ?? "",
			url,
		);
		if (
			destination.protocol === "https:" &&
			!destination.username &&
			!destination.password &&
			!destination.port &&
			/^[a-z\d-]+(?:\.[a-z\d-]+)+$/i.test(destination.hostname) &&
			!/^\d+(?:\.\d+){3}$/.test(destination.hostname) &&
			!/(?:localhost|\.local|\.internal|\.invalid|\.test)$/i.test(
				destination.hostname,
			)
		)
			return url;
		throw createError({
			statusCode: 422,
			statusMessage: "GitHub Pages redirected to an unsupported site address",
		});
	}
	if (response.status === 404)
		throw createError({
			statusCode: 422,
			statusMessage:
				"No published GitHub Pages user site found. Follow the GitHub Pages setup instructions, then retry.",
		});
	if (!response.ok)
		throw createError({
			statusCode: 502,
			statusMessage: "Unable to validate GitHub Pages now; retry shortly",
		});
	await boundedBytes(response, 2_000_000);
	return url;
}
