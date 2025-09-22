import { drizzle } from "drizzle-orm/neon-serverless";
import * as schemas from "./schema/schemas";
import { relations } from "drizzle-orm";
import { EventHandlerRequest, H3Event, type H3EventContext } from "h3";

/**
 * Import the generated drizzle tables
 */
export const DrizzleTables = schemas;

/**
 * Remember the event context for later use
 */
export let ServerContext: H3EventContext | null = null;
export function SetServerContext(ctx: H3EventContext) {
	ServerContext = ctx;
}

/**
 * Extend the environment with the Hyperdrive binding
 */
// export interface Env {
// 	// If you set another name in wrangler.toml as the value for 'binding',
// 	// replace "HYPERDRIVE" with the variable name you defined.
// 	HYPERDRIVE: Hyperdrive;
// }

/**
 * Create a drizzle instance for type-safe database access
 */
export function UseDrizzle(event: H3Event<EventHandlerRequest> | null) {
	const ctx: H3EventContext | null = event?.context ?? null;
	const connectionString: string = GetDrizzleConnecionString(
		ctx ?? ServerContext,
	);
	const driz = drizzle(connectionString, {
		schema: { ...DrizzleTables, ...relations },
	});
	return driz;
}

export function GetDrizzleConnecionString(ctx: H3EventContext | null): string {
	let config: ReturnType<typeof useRuntimeConfig> | null = null;

	try {
		config = useRuntimeConfig();
	} catch (e) {
		throw Error("[UseDrizzle] Error: reading runtime config");
	}

	// Local development
	let connectionString: string = config.private.postgres.url;

	// Cloudflare Workers - use hyperdrive proxy
	const hyperdriveConnectionString =
		ctx?.cloudflare?.env?.NUXT_HYPERDRIVE?.connectionString;
	if (!!hyperdriveConnectionString) {
		connectionString = hyperdriveConnectionString;
	}

	console.log("[UseDrizzle] Connection string: " + connectionString);
	return connectionString;
}

export type DrizzleType = ReturnType<typeof UseDrizzle>;
