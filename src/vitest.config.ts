import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
	resolve: {
		alias: {
			"#server": resolve(__dirname, "server"),
			"#shared": resolve(__dirname, "shared"),
			"~": resolve(__dirname, "app"),
			"~~": resolve(__dirname, "."),
			"@": resolve(__dirname, "app"),
		},
	},
	test: {
		environment: "node",
	},
});
