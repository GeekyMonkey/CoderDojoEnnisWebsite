import { defineEventHandler } from "h3";
import { ThemesService } from "~~/server/services/ThemesService";
import { UiConfigModel } from "~~/shared/types/UiConfigModel";

// GET: /Config/UiConfig
export default defineEventHandler(
	async (event): Promise<ApiResponse<UiConfigModel>> => {
		const uiConfig: UiConfigModel = {
			themesConfig: await new ThemesService().GetThemes(),
		};
		return {
			data: uiConfig,
			success: true,
		};
	},
);
