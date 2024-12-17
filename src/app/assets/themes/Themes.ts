/**
 * List of theme descriptions
 */
import brightTheme from "./bright/bright";
import bulmaTheme from "./bulma/bulma";
import crtTheme from "./crt/crt";
import neonTheme from "./neon/neon";

export const Themes: ThemeModel[] = [
	brightTheme,
	bulmaTheme,
	crtTheme,
	neonTheme,
];
console.log("Themes: " + JSON.stringify(Themes));
