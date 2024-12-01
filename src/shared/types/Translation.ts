/**
 * Supported languages array
 */
export const LangCodes = ["en", "fr"] as const;

/**
 * Supported languages type
 */
export type LangCode = (typeof LangCodes)[number];

/**
 * Translation type
 */
export type Translation = {
	en: string;
} & {
	[langCode in Exclude<LangCode, "en">]?: string;
};

/**
 * Translate a translation object to a specific language or return the default (en) translation
 */
export const TranslateToLanguage = (
	translation: Translation | null,
	lang: LangCode,
	values?: Record<string, string | unknown>,
): string | null => {
	if (!translation) {
		return null;
	}
	let translated = translation[lang] ?? translation.en ?? translation;

	if (values) {
		Object.keys(values).forEach((key) => {
			translated = translated.replace(`{${key}}`, values[key] as string);
		});
	}

	return translated;
};
