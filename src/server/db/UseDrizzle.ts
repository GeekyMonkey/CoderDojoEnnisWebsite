import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schemas from "./schema/schemas";

const loggingDb: boolean = false;

/**
 * Import the generated drizzle tables
 */
export const DrizzleTables = schemas;

/**
 * Create a drizzle instance for type-safe database access
 */
export function UseDrizzle() {
	const config = useRuntimeConfig();
	const dbUrl: string = `postgresql://${config.private.supabase.user}:${config.private.supabase.userpass}@${config.private.supabase.host}:${config.private.supabase.port}/postgres`;
	const client = postgres(dbUrl, {
		prepare: false,
	});
	const db = drizzle({ client, schema: { ...schemas }, logger: loggingDb });
	return db;
}

export type DrizzleType = ReturnType<typeof UseDrizzle>;
