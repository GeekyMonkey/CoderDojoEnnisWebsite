import { defineNuxtPlugin, useNuxtApp } from "nuxt/app";
import { useLogger } from "~~/shared/utils/Logger";

const log = useLogger("startup-plugin");

export default defineNuxtPlugin({
	name: "startup-plugin",
	enforce: "pre", // or 'post'
	async setup(nuxtApp) {
		// this is the equivalent of a normal functional plugin
		log.info("--Starting CoderDojo Nuxt Website--");
	},
	hooks: {
		// You can directly register Nuxt app runtime hooks here
		"app:created"() {
			const nuxtApp = useNuxtApp();
			log.info("--Created CoderDojo Nuxt Website--");
			log.info("Public Env Variables:", {
				public: nuxtApp.$config.public,
			});
		},
	},
	env: {
		// Set this value to `false` if you don't want the plugin to run when rendering server-only or island components.
		islands: true,
	},
});
