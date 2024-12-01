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
