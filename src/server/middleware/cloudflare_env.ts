import type { H3Event } from "h3";

// import { SetServerContext } from "~~/server/db/UseDrizzle";

const log = useLogger("Middleware-Cloudflare");

export default defineEventHandler((event: H3Event) => {
	log.verbose("Setting server context", event.context);
	// SetServerContext(event.context);
});
