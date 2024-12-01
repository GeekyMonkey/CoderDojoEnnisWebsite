import { ThemesConfig, ThemeModel } from "~~/shared/types/ThemeModel";
import { Themes } from "~~/app/assets/themes/Themes";

// Cache
let themesConfig: ThemesConfig | null = null;

/** Server side cached data store for themes models read from the file system */
export class ThemesService {
	constructor() {}

	/**
	 * Get the themes from the cache or read from the file system
	 */
	async GetThemes(): Promise<ThemesConfig> {
		if (!themesConfig) {
			themesConfig = await this.ReadThemes();
		}

		return themesConfig;
	}

	/**
	 * Read all of the themes from the json files in the /public/themes folder
	 */
	ReadThemes = async (): Promise<ThemesConfig> => {
		// Get the themes from the assets folder
		const themes: ThemeModel[] = Themes;

		// Process the themes
		const defaultDarkThemeId =
			themes.find((t) => t.id === "neon")?.id ??
			themes.find((t) => t.darkOrLight == "dark")?.id ??
			"";
		const defaultLightThemeId =
			themes.find((t) => t.id === "bright")?.id ??
			themes.find((t) => t.darkOrLight == "light")?.id ??
			"";

		return {
			themes,
			defaultDarkThemeId,
			defaultLightThemeId,
		};
	};
}
