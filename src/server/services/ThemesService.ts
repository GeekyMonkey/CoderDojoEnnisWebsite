import { ThemesConfig, ThemeModel } from "~~/shared/types/ThemeModel";
import * as fs from "fs/promises";

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
		const themeFolders: string[] = await fs.readdir("public/themes");
		const themesData: (ThemeModel | null)[] = await Promise.all(
			themeFolders.map(async (themeFolder) => {
				try {
					const themeFileName: string = `public/themes/${themeFolder}/${themeFolder}.json`;
					const themeJson = await fs.readFile(themeFileName);
					const theme: ThemeModel = {
						...(JSON.parse(themeJson.toString()) as ThemeModel),
						folder: themeFolder,
					};
					return theme;
				} catch (e) {
					console.error(`Error reading theme: ${themeFolder}`, e);
					return null;
				}
			}),
		);
		const themes: ThemeModel[] = themesData.filter(
			(theme) => theme !== null,
		);
		const defaultDarkTheme =
			themes.find((t) => t.folder === "neon")?.folder ??
			themes.find((t) => t.darkOrLight == "dark")?.folder ??
			"";
		const defaultLightTheme =
			themes.find((t) => t.folder === "bright")?.folder ??
			themes.find((t) => t.darkOrLight == "light")?.folder ??
			"";

		return {
			themes,
			defaultDarkTheme,
			defaultLightTheme,
		};
	};
}
