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
    // "@vueuse/nuxt",
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
    middleware: {},
    static: true,
  },

  plugins: [
  ],

  router: {
    options: {
      scrollBehaviorType: "smooth",
    },
  },

  runtimeConfig: {
    private: {},
    public: {},
  },

  serverMiddleware: [
  ],

  ssr: true,

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
});
