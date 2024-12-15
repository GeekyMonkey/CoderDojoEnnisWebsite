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
		preference: "neon",
	},

	compatibilityDate: "2024-08-01",

	components: true,

	css: ["~/assets/css/app.scss", "~/assets/themes/Themes.css"],

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
		dirs: [
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
		// "@nuxt/image",
		// "@primevue/nuxt-module",
		// "@nuxt/scripts",
		"@hebilicious/vue-query-nuxt",
		"@nuxt/icon",
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
				url: process.env.NUXT_SUPABASE_URL,
				key: process.env.NUXT_SUPABASE_KEY_PUBLIC,
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

	vueQuery: {
		// useState key used by nuxt for the vue query state.
		// stateKey: "vue-query-nuxt", // default
		// If you only want to import some functions, specify them here.
		// You can pass false or an empty array to disable this feature.
		// default: ["useQuery", "useQueries", "useInfiniteQuery", "useMutation", "useIsFetching", "useIsMutating", "useQueryClient"]
		// autoImports: ["useQuery"],
		// Pass the vue query client options here ...
		queryClientOptions: {
			// defaultOptions: { queries: { staleTime: 5000 } }, // default
			defaultOptions: {
				queries: {
					// behavior: // todo (what are the options?)
					gcTime: 1000 * 60 * 60 * 24, // 24 hours
					placeholderData: [],
					refetchOnReconnect: "always",
					refetchOnWindowFocus: true,
					refetchOnMount: false,
					retry: 3,
					staleTime: 10000,
				},
			},
		},
		// Pass the vue query plugin options here ....
		vueQueryPluginOptions: {},
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
			key: "certs/server.key",
			cert: "certs/server.cert",
		},
	},
});
