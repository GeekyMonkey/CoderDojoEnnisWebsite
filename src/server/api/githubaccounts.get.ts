import { defineEventHandler } from "h3";

export default defineEventHandler(async (event): Promise<any[]> => {
	setResponseHeader(event, "Cache-Control", "public, max-age=300"); // Cache for 5 minutes

	// proxy to the old api
	const response = await fetch(
		"https://coderdojomember.azurewebsites.net/api/githubaccounts",
	);
	const users = await response.json();
	return users;
});
