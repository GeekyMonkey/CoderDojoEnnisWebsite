/**
 * List of theme descriptions
 */
import brightTheme from "./bright/bright";
import crtTheme from "./crt/crt";
import neonTheme from "./neon/neon";

export const Themes: ThemeModel[] = [brightTheme, crtTheme, neonTheme];
console.log("Themes: " + JSON.stringify(Themes));
