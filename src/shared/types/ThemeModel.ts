import type { Translation } from "./Translation";

/**
 * Description of a styling theme
 */
export type ThemeModel = {
	/** The folder name of the theme */
	id: string;

	// Valuse from the theme json file

	/** Who created the theme */
	author: string;

	/** Multi-lingual theme name */
	themeName: Translation;

	/** Is this theme primarily dark or light? */
	darkOrLight: "dark" | "light";
};

/**
 * Configuration for the themes
 */
export type ThemesConfig = {
	themes: ThemeModel[];
	defaultDarkThemeId: string;
	defaultLightThemeId: string;
};
