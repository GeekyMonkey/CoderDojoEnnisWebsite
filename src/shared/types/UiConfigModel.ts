import type { ThemesConfig } from "./ThemeModel";

/**
 * Configuration for the UI
 */
export type UiConfigModel = {
	themesConfig: ThemesConfig;

	// ToDo: remove this
	dbConnection: any;
	env: any;
};
