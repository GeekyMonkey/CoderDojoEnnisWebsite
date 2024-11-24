import fs from "fs";
import path from "path";
// import { buildTime, version } from "./build/Version";
import { defineNuxtConfig } from "nuxt/config";
import { supabase } from "~/utils/supabaseClient";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      title: "CoderDojo Ennis",
      htmlAttrs: {},
      bodyAttrs: {
        class: "dark",
        style: "background-color:black;",
      },
    },
    layoutTransition: false,
    pageTransition: false,
  },

  // builder: "vite",

  colorMode: {
    preference: "dark",
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
        url: process.env.SUPABASE_URL,
        key: process.env.SUPABASE_KEY,
      },
      // baseUrl: isIonic ? "https://mealcritic.geekymonkey.com" : "",
      // buildTarget: buildTarget,
      // buildTimeString: String(buildTime),
      // isIonic: isIonic,
      // isPwa: isPwa,
      // version: version,
    },
    private: {
      supabase: {
        url: process.env.SUPABASE_URL,
        key: process.env.SUPABASE_KEY,
        password: process.env.SUPABASE_PASSWORD,
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
