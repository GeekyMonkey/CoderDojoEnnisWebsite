import { defineNuxtPlugin, useNuxtApp } from "nuxt/app";

export default defineNuxtPlugin({
	name: "startup-plugin",
	enforce: "pre", // or 'post'
	async setup(nuxtApp) {
		// this is the equivalent of a normal functional plugin
		console.log("--Starting CoderDojo Nuxt Website--");
	},
	hooks: {
		// You can directly register Nuxt app runtime hooks here
		"app:created"() {
			const nuxtApp = useNuxtApp();
			console.log("--Created CoderDojo Nuxt Website--");
		},
	},
	env: {
		// Set this value to `false` if you don't want the plugin to run when rendering server-only or island components.
		islands: true,
	},
});
