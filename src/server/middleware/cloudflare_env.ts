import type { H3Event } from "h3";
import { useLogger } from "#shared/utils/Logger";

const log = useLogger("Middleware-Cloudflare");

export default defineEventHandler((event: H3Event) => {
	log.verbose("Setting server context", event.context);
	// SetServerContext(event.context);
});
