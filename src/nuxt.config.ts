import { defineNuxtConfig } from "nuxt/config";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	app: {
		head: {
			title: "CoderDojo Ennis",
			htmlAttrs: { lang: "en" },
			bodyAttrs: { class: "dark" },
		},
		layoutTransition: false,
		pageTransition: false,
	},

	colorMode: {
		preference: "dark",
	},

	compatibilityDate: "2024-07-19",

	css: [
		"~/assets/css/tailwind.scss",
		"~/assets/css/shadcn.scss",
		"~/assets/css/app.scss",
	],

	devtools: { enabled: false },

	future: {
		compatibilityVersion: 4,
	},

	i18n: {
		detectBrowserLanguage: {
			alwaysRedirect: false,
			cookieCrossOrigin: true,
			cookieKey: "i18n_redirected",
			cookieSecure: false,
			fallbackLocale: "en",
			redirectOn: "all",
			useCookie: true,
		},
		experimental: {
			localeDetector: "../i18n/localeDetector.ts",
		},
		locales: [
			{ code: "en", language: "English" },
			{ code: "fr", language: "Français" },
		],
		strategy: "no_prefix",
		vueI18n: "../i18n/i18n.config.ts",
	},

	icon: {
		aliases: {
			nuxt: "logos:nuxt-icon",
			Language: "akar-icons:language", // or heroicons:globe-alt
		},
		componentName: "NuxtIcon",
		// customCollections: [
		//   {
		//     prefix: "asset-icon",
		//     dir: "./assets/icons",
		//   },
		// ],
		serverBundle: {
			collections: ["heroicons", "logos", "util"],
		},
		size: "24px", // default <Icon> size applied
		class: "icon", // default <Icon> class applied
		mode: "css", // default <Icon> mode applied
	},

	imports: {
		// dirs: ["~~/models"],
	},

	modules: [
		// "@nuxt/image",
		// "@primevue/nuxt-module",
		// "@nuxt/scripts",
		// "@nuxtjs/supabase",
		"@nuxt/icon",
		"@nuxtjs/color-mode",
		"@nuxtjs/i18n",
		"@nuxtjs/tailwindcss",
		"@vueuse/nuxt",
		"shadcn-nuxt",
	],

	nitro: {
		esbuild: {
			options: {
				target: "esnext",
			},
		},
		experimental: {
			asyncContext: true,
			openAPI: false,
			// openAPI: {
			//   meta: {
			//     title: "My Awesome Project",
			//     description: "This might become the next big thing.",
			//     version: "1.0",
			//   },
			// }
		},
		// middleware: {},
		// plugins: [{ src: "~~/plugins/nitro/startup.ts", mode: "server" }],
		static: false,
	},

	// plugins: [],

	router: {
		options: {
			scrollBehaviorType: "smooth",
		},
	},

	runtimeConfig: {
		private: {},
		public: {},
	},

	// serverMiddleware: [],

	shadcn: {
		/**
		 * Prefix for all the imported component
		 */
		prefix: "",

		/**
		 * Directory that the component lives in.
		 */
		componentDir: "./app/components/ui",
	},

	ssr: false,

	typescript: {
		tsConfig: {
			compilerOptions: {
				baseUrl: ".",
			},
		},
	},

	vite: {
		css: {
			preprocessorOptions: {
				sass: {},
			},
		},
	},

	$development: {
		app: {
			head: {
				titleTemplate: "%s : DEV",
			},
		},
		runtimeConfig: {
			public: {
				baseUrl: "",
			},
		},
	},

	devServer: {
		https: {
			key: "certs/mylocalhost.key",
			cert: "certs/mylocalhost.crt",
		},
	},
});
