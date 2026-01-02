import { defineNuxtConfig } from "nuxt/config";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	alias: {
		"process/": "process",
		// string_decoder: "string_decoder/",
	},

	app: {
		head: {
			title: "CoderDojo Ennis",
			htmlAttrs: {},
			bodyAttrs: {
				class: "",
				style: "background-color:black;",
			},
			meta: [
				{
					name: "viewport",
					content: "width=device-width, initial-scale=1.0",
				},
			],
			// link: [
			// 	{
			// 		prefetch: "true",
			// 		rel: "stylesheet",
			// 		href: "/themes/Themes.css",
			// 	},
			// ],
		},
		layoutTransition: false,
		pageTransition: false,
	},

	build: {},

	// builder: "vite",

	colorMode: {
		classSuffix: "-mode",
		preference: "neon",
	},

	compatibilityDate: "2025-05-15",

	components: [
		{ path: "~/components", pathPrefix: false },
		{ path: "~/components/Attendance", pathPrefix: false },
		{ path: "~/components/Common", pathPrefix: false },
		{ path: "~/components/Modals", pathPrefix: false },
		{ path: "~/components/Teams", pathPrefix: false },
		{ path: "~/components/Themes", pathPrefix: false },
	],

	css: ["~/assets/css/app.css", "~/assets/themes/Themes.css"],

	devtools: { enabled: false },

	experimental: {
		scanPageMeta: "after-resolve",
	},

	future: {
		compatibilityVersion: 5,
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
		// experimental: {
		// 	localeDetector: "../i18n/localeDetector.ts",
		// },
		langDir: "../i18n/locales/",
		locales: [
			{ code: "en", file: "en.ts", language: "English" },
			{ code: "fr", file: "fr.ts", language: "Français" },
			{ code: "ga", file: "ga.ts", language: "Gaeilge" },
			{ code: "uk", file: "uk.ts", language: "Українська" },
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

	// image: {
	// 	quality: 90,
	// },

	imports: {
		dirs: [
			"~~/shared/utils",
			// "~~/src/app/components",
			// "~/stores",
		],
		autoImport: true,
		imports: [
			{
				from: "zod",
				name: "z",
			},
		],
	},

	modules: [
		"@nuxt/icon",
		"@nuxt/ui",
		"@nuxtjs/color-mode",
		"@nuxtjs/google-fonts",
		"@nuxtjs/i18n",
		"@nuxtjs/supabase",
		"@vueuse/nuxt",
		"nitro-cloudflare-dev",
	],

	nitro: {
		esbuild: {
			options: {
				target: "esnext",
			},
		},
		experimental: {
			// asyncContext: true,
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
		preset: "cloudflare-pages",
		rollupConfig: {
			external: ["postgres"],
		},
		static: false,
	},

	plugins: [],

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
			environment: {
				runtime: process.env.NUXT_ENV_RUNTIME || "development", // "cloudflare" | "development"
			},
			supabase: {
				url: process.env.NUXT_PUBLIC_SUPABASE_URL,
				key: process.env.NUXT_PUBLIC_SUPABASE_KEY,
			},
			// baseUrl: isIonic ? "https://mealcritic.geekymonkey.com" : "",
			// buildTarget: buildTarget,
			// buildTimeString: String(buildTime),
			// isIonic: isIonic,
			// isPwa: isPwa,
			// version: version,
		},
		private: {
			auth: {
				pass_salt: process.env.NUXT_PASS_SALT,
			},
			legacy_data: {
				pass: process.env.NUXT_LEGACY_DB_PASS,
				user: process.env.NUXT_LEGACY_DB_USER,
			},
			postgres: {
				url: process.env.NUXT_POSTGRES_URL,
				// hyperdrive: ServerContext?.cloudflare?.env?.NUXT_HYPERDRIVE?.connectionString
			},
			supabase: {
				url: process.env.NUXT_SUPABASE_URL,
				key: process.env.NUXT_SUPABASE_KEY_PUBLIC,
				key_private: process.env.NUXT_SUPABASE_KEY_PRIVATE,
			},
		},
	},
	// serverMiddleware: [],

	ssr: false,

	supabase: {
		redirect: false,
		types: "~~/types/supabase.ts",
	},

	typescript: {
		tsConfig: {
			compilerOptions: {
				baseUrl: ".",
			},
		},
	},

	watch: ["~/assets/**/*.ts", "~/assets/**/*.css"],

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
			key: "../certs/localhost.key",
			cert: "../certs/localhost.cert",
		},
	},
});
