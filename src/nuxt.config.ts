import { defineNuxtConfig } from "nuxt/config";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      title: "CoderDojo Ennis",
      htmlAttrs: { lang: "en", class: "dark" },
      bodyAttrs: { class: "dark" },
    },
    layoutTransition: false,
    pageTransition: false,
  },

  compatibilityDate: "2024-07-19",

  css: ["~~/assets/css/app.scss"],

  devtools: { enabled: false },

  future: {
    compatibilityVersion: 4,
  },

  imports: {
    // dirs: ["~~/models"],
  },

  modules: [
    // "@nuxt/icon",
    // "@nuxt/image",
    // "@primevue/nuxt-module",
    // "@nuxt/scripts",
    // "@nuxtjs/supabase",
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
