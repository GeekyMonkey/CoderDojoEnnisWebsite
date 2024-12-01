import { defineNuxtConfig } from "nuxt/config";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	app: {
		head: {
			title: "CoderDojo Ennis",
			htmlAttrs: {},
			bodyAttrs: {
				class: "",
				style: "background-color:black;",
			},
			link: [
				{
					prefetch: "true",
					rel: "stylesheet",
					href: "/themes/themes.css",
				},
			],
		},
		layoutTransition: false,
		pageTransition: false,
	},

	build: {},

	// builder: "vite",

	colorMode: {
		preference: "neon",
	},

	compatibilityDate: "2024-08-01",

	css: [
		"~/assets/css/tailwind.scss",
		"~/assets/css/shadcn.scss",
		"~/assets/css/app.scss",
	],

	devtools: { enabled: false },

	experimental: {
		scanPageMeta: "after-resolve",
	},

	future: {
		compatibilityVersion: 4,
	},

	googleFonts: {
		download: true,
		families: {
			"Nunito Sans": {
				wght: "200..900",
				ital: "200..700",
			},
		},
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
		// Icon Options: https://icones.js.org/
		aliases: {
			Language: "akar-icons:language", // or heroicons:globe-alt
			Theme: "mdi:theme-light-dark",
		},
		componentName: "NuxtIcon",
		// customCollections: [
		//   {
		//     prefix: "asset-icon",
		//     dir: "./assets/icons",
		//   },
		// ],
		serverBundle: {
			collections: ["heroicons", "logos", "mdi", "util"],
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
		"@hebilicious/vue-query-nuxt",
		"@nuxt/icon",
		"@nuxtjs/color-mode",
		"@nuxtjs/google-fonts",
		"@nuxtjs/i18n",
		"@nuxtjs/supabase",
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

	// redirectOptions: {
	// 	login: "/auth",
	// 	enabled: true,
	// },

	router: {
		options: {
			scrollBehaviorType: "smooth",
		},
	},

	runtimeConfig: {
		public: {
			supabase: {
				url: process.env.NUXT_SUPABASE_URL || process.env.SUPABASE_URL,
				key: process.env.NUXT_SUPABASE_KEY || process.env.SUPABASE_KEY,
			},
			// baseUrl: isIonic ? "https://mealcritic.geekymonkey.com" : "",
			// buildTarget: buildTarget,
			// buildTimeString: String(buildTime),
			// isIonic: isIonic,
			// isPwa: isPwa,
			// version: version,
		},
		private: {
			legacy_data: {
				pass: process.env.NUXT_LEGACY_DB_PASS,
				user: process.env.NUXT_LEGACY_DB_USER,
			},
			supabase: {
				url: process.env.NUXT_SUPABASE_URL,
				key: process.env.NUXT_SUPABASE_KEY,
				password: process.env.NUXT_SUPABASE_PASSWORD,
				host: process.env.NUXT_SUPABASE_HOST,
				user: process.env.NUXT_SUPABASE_USER,
				userpass: process.env.NUXT_SUPABASE_USERPASS,
				port: process.env.NUXT_SUPABASE_PORT,
			},
		},
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

	supabase: {
		redirectOptions: {
			login: "/login",
			callback: "/logged_in",
			include: [
				// Secured paths
				"/coder(/*)?",
				"/mentor(/*)?",
				"/parent(/*)?",
				"/debug(/*)?",
			],
			exclude: [],
			cookieRedirect: true,
		},
	},

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
			key: "certs/server.key",
			cert: "certs/server.cert",
		},
	},
});
