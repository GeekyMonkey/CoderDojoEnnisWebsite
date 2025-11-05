// Do this to include the translations in the bundle rather than lazy loading
// import en from "./locales/en";
// import fr from "./locales/fr";
// import uk from "./locales/uk";

/**
 * i18n configuration
 * See also shared/types/Translation.ts for supported languages
 */
const i18nConfig = defineI18nConfig(() => ({
	fallbackLocale: "en",
	legacy: false,
	// Do this to include the translations in the bundle rather than lazy loading
	// messages: {
	// 	en,
	// 	fr,
	// 	uk,
	// },
}));

export default i18nConfig;
