import { drizzle } from "drizzle-orm/neon-serverless";
import * as schemas from "./schema/schemas";
import { relations } from "drizzle-orm";
import { type H3EventContext } from "h3";
// import { Hyperdrive } from "@cloudflare/workers-types";

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
export function UseDrizzle() {
	const connectionString: string = GetDrizzleConnecionString();
	const driz = drizzle(connectionString, {
		schema: { ...DrizzleTables, ...relations },
	});
	return driz;
}

export function GetDrizzleConnecionString(): string {
	let config: ReturnType<typeof useRuntimeConfig> | null = null;

	try {
		config = useRuntimeConfig();
	} catch (e) {
		throw Error("[UseDrizzle] Error: reading runtime config");
	}

	let connectionString: string = config.private.postgres.url;

	if (ServerContext?.cloudflare?.env?.HYPERDRIVE?.connectionString) {
		connectionString =
			ServerContext?.cloudflare?.env?.HYPERDRIVE?.connectionString;
	}
	return connectionString;
}

export type DrizzleType = ReturnType<typeof UseDrizzle>;
