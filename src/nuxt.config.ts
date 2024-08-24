// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-08-24",
  devtools: { enabled: false },
  future: {
    compatibilityVersion: 4,
  },
  nitro: {
    static: true,
  },
});
