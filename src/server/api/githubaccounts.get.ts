import { createError, defineEventHandler, type H3Event } from "h3";

/** Proxy the public GitHub accounts list and validate its response. */
export default defineEventHandler(async (event: H3Event): Promise<unknown[]> => {
	setResponseHeader(event, "Cache-Control", "public, max-age=300"); // Cache for 5 minutes

	// proxy to the old api
	const response: Response = await fetch(
		"https://coderdojomember.azurewebsites.net/api/githubaccounts",
	);
	const users: unknown = await response.json();
	if (!response.ok || !Array.isArray(users)) {
		throw createError({
			statusCode: 502,
			statusMessage: "Invalid GitHub accounts response",
		});
	}
	return users;
});
