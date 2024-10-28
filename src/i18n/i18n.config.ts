import { en } from "./locales/en";
import { fr } from "./locales/fr";

export default defineI18nConfig(() => ({
  fallbackLocale: "en",
  legacy: false,
  messages: {
    en,
    fr,
  },
}));
