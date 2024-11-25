import { drizzle } from "drizzle-orm/node-postgres";
import { createClient } from "@supabase/supabase-js";
import * as schemas from "./schema/schemas";
import * as relations from "./schema/relations";

let dbInstance: ReturnType<typeof getDb> | null = null;
export const DB = (): ReturnType<typeof getDb> => {
	if (!dbInstance) {
		dbInstance = getDb();
	}
	return dbInstance;
};

const getDb = () => {
	const schema = "coderdojo";
	const config = useRuntimeConfig();
	const supabaseUrl = config.public.supabase.url;
	const supabaseServiceRoleKey = config.private.supabase.password;

	// Create Supabase client with schema specified
	// const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
	// 	db: {
	// 		schema,
	// 	},
	// });

	// ToDo: If migrating set max=1 for connections

	const db = drizzle({
		connection: {
			// client: supabase,
			schema: schema,
			host: supabaseUrl,
			authToken: supabaseServiceRoleKey,
		},
		casing: "snake_case",
		logger: true,
		schema: { ...schemas, ...relations },
	});

	return db;
};
