import postgres from "postgres";
import { drizzle } from "drizzle-orm/neon-serverless";
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
 * Create a drizzle instance for type-safe database access
 */
export function UseDrizzle() {
	const config = useRuntimeConfig();
	const dbUrl: string = GetDrizzleConnecionString;()

	const hdConfig: Hyperdrive = process.env
		.HYPERDRIVE as unknown as Hyperdrive;
	const hdConnectionString: string | null =
		hdConfig?.connectionString ?? null;
	if (typeof env !== 'undefined' && env?.HYPERDRIVE && env.HYPERDRIVE.connectionString) {
		// Running from Cloudflare Workers
		dbUrl = hdConnectionString;
	} else {
		// Running from local machine
		dbUrl = `postgresql://${config.private.supabase.user}:${config.private.supabase.userpass}@${config.private.supabase.host}:${config.private.supabase.port}/postgres`;
	}

	const client = postgres(dbUrl, {
		prepare: false,
	});
	const db = drizzle({ client, schema: { ...schemas }, logger: loggingDb });
	return db;
}

/**
 * Get a connection string for drizzle postgres based on where the code is running
 */
export const GetDrizzleConnecionString = (): string => {
	let dbUrl: string = "";
	let hdConnectionString: string | null = null;
	let config: ReturnType<typeof useRuntimeConfig> | null = null;

	debugger;
	try {
		config = useRuntimeConfig();
	} catch (e) {
		return "Error: reading runtime config";
	}

	try {
		const hdConfig: Hyperdrive = process.env
			.HYPERDRIVE as unknown as Hyperdrive;
		hdConnectionString = hdConfig?.connectionString ?? null;
	} catch (e) {
		return "Error: reading hyperdrive config";
	}

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
