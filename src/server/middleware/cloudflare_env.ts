import type { H3Event } from "h3";

const log = useLogger("Middleware-Cloudflare");

export default defineEventHandler((event: H3Event) => {
	log.verbose("Setting server context", event.context);
	// SetServerContext(event.context);
});
