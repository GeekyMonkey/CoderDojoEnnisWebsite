import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default defineConfig({
	plugins: [vue()],
	resolve: {
		alias: {
			"~~": resolve(__dirname, "."),
			"@": resolve(__dirname, "."),
			"~": resolve(__dirname, "."),
		},
	},
	test: {
		globals: true,
		environment: "jsdom",
		setupFiles: "./vitest.setup.ts",
	},
});
