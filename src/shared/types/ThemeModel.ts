import type { Translation } from "./Translation";

/**
 * Description of a styling theme
 */
export type ThemeModel = {
	author: string;
	folder: string;
	themeName: Translation;
	darkOrLight: "dark" | "light";
};

/**
 * Configuration for the themes
 */
export type ThemesConfig = {
	themes: ThemeModel[];
	defaultDarkTheme: string;
	defaultLightTheme: string;
};
