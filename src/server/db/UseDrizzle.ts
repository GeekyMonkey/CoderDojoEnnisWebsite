import { drizzle } from "drizzle-orm/neon-serverless";
import * as schemas from "./schema/schemas";
import { relations } from "drizzle-orm";
import { Hyperdrive } from "@cloudflare/workers-types";

/**
 * Import the generated drizzle tables
 */
export const DrizzleTables = schemas;

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
	let config: ReturnType<typeof useRuntimeConfig> | null = null;

	try {
		config = useRuntimeConfig();
	} catch (e) {
		throw Error("[UseDrizzle] Error: reading runtime config");
	}

	let connectionString: string = config.private.postgres.url;
	if (config.private.hyperdrive?.connectionString) {
		connectionString =
			config.private.hyperdrive.connectionString || connectionString;
	}

	const driz = drizzle(connectionString, {
		schema: { ...DrizzleTables, ...relations },
	});
	return driz;
}

export type DrizzleType = ReturnType<typeof UseDrizzle>;
