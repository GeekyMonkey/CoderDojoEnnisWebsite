/**
 * List of theme descriptions
 */
import brightTheme from "./bright/bright";
import crtTheme from "./crt/crt";
import neonTheme from "./neon/neon";

const log = useLogger("Themes");

export const Themes: ThemeModel[] = [brightTheme, crtTheme, neonTheme];
log.info("Hard coded themes ",{ Themes });
	