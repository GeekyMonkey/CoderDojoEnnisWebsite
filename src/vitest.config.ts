import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
 plugins: [vue()],
 // Browser-facing composables are tested with the Nuxt client flag enabled.
 define: { "import.meta.client": true },
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
