import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
	dialect: "postgresql",
	casing: "snake_case",
	out: "./drizzle/migrations",
	schema: "coderdojo",
	schemaFilter: ["coderdojo"],
	introspect: { casing: "camel" },
	tablesFilter: ["*"],
	dbCredentials: {
		url: process.env.SUPABASE_URL!,
		// password: process.env.SUPABASE_PASSWORD!,
		host: process.env.SUPABASE_HOST,
		database: "postgres",
		user: process.env.SUPABASE_USER || "postgres",
		password: process.env.SUPABASE_USERPASS!,
		port: parseInt(process.env.DATABASE_PORT || "5432", 10),
		ssl: {
			rejectUnauthorized: false,
		},
	},
});
