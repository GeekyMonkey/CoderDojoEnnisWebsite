import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schemas from "./schema/schemas";
import { Hyperdrive } from "@cloudflare/workers-types";

const loggingDb: boolean = false;

/**
 * Import the generated drizzle tables
 */
export const DrizzleTables = schemas;

export interface env {
	// If you set another name in wrangler.toml as the value for 'binding',
	// replace "HYPERDRIVE" with the variable name you defined.
	HYPERDRIVE: Hyperdrive;
}

/**
 * Get a connection string for drizzle postgres based on where the code is running
 */
export const GetDrizzleConnecionString = (): string => {
	let dbUrl: string;
	const config = useRuntimeConfig();
	const hdConfig: Hyperdrive = process.env
		.HYPERDRIVE as unknown as Hyperdrive;
	const hdConnectionString: string | null =
		hdConfig?.connectionString ?? null;
	if (hdConnectionString) {
		// Running from Cloudflare Workers
		dbUrl = hdConnectionString;
	} else {
		// Running from local machine
		dbUrl = `postgresql://${config.private.supabase.user}:${config.private.supabase.userpass}@${config.private.supabase.host}:${config.private.supabase.port}/postgres`;
	}
	return dbUrl;
};

/**
 * Create a drizzle instance for type-safe database access
 */
export function UseDrizzle() {
	const dbUrl: string = GetDrizzleConnecionString();
	const client = postgres(dbUrl, {
		prepare: false,
	});
	const db = drizzle({ client, schema: { ...schemas }, logger: loggingDb });
	return db;
}

export type DrizzleType = ReturnType<typeof UseDrizzle>;
