import { type NamedValue, useI18n } from "vue-i18n";

/**
 * Translation composable
 */
export function useTranslation() {
	const { locale, t: $t } = useI18n();

	/**
	 * Translate a translation object to the current language
	 * Uses either vue i18n for $t or our own Translation object type
	 */
	const Translate = (
		key: Translation | null | string,
		values?: NamedValue,
	): string | null => {
		if (!key) {
			return null;
		}
		if (typeof key === "string") {
			return values ? $t(key, values) : $t(key);
		}
		return TranslateToLanguage(key, locale.value as LangCode, values) ?? null;
	};

	/**
	 * Translate a translation object to a specific language or return the given default text
	 */
	const TranslateOrDefault = (
		key: Translation | null | string,
		defaultText: string,
		values?: NamedValue,
	): string => {
		return Translate(key, values) ?? defaultText;
	};

	return {
		Translate,
		TranslateOrDefault,
	};
}
