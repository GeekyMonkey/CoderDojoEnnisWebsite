import { H3Event } from "h3";
import { SetServerContext } from "~~/server/db/UseDrizzle";

export default defineEventHandler((event: H3Event) => {
	console.log(
		"[Middleware-Cloudflare] Setting server context",
		event.context,
	);
	SetServerContext(event.context);
});
