/**
 * List of theme descriptions
 */
import darkTheme from "./dark/dark";
import crtTheme from "./crt/crt";
import lightTheme from "./light/light";
import { useLogger } from "~~/shared/utils/Logger";

const log = useLogger("Themes");

export const Themes: ThemeModel[] = [lightTheme, darkTheme, crtTheme];
log.info("Hard coded themes ", { Themes });
