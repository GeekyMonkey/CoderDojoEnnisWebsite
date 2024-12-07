import { drizzle } from "drizzle-orm/neon-serverless";
import * as schemas from "./schema/schemas";
import { relations } from "drizzle-orm";

/**
 * Import the generated drizzle tables
 */
export const DrizzleTables = schemas;

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

	const driz = drizzle(config.private.postgres.url, {
		schema: { ...DrizzleTables, ...relations },
	});
	return driz;
}

export type DrizzleType = ReturnType<typeof UseDrizzle>;
