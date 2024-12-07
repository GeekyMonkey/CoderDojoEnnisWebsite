import { defineEventHandler } from "h3";
import { GetDrizzleConnecionString } from "~~/server/db/UseDrizzle";
import { ThemesService } from "~~/server/services/ThemesService";
import { ThemesConfig, ThemesConfigDefault } from "~~/shared/types/ThemeModel";
import { UiConfigModel } from "~~/shared/types/UiConfigModel";

// GET: /Config/UiConfig
export default defineEventHandler(
	async (event): Promise<ApiResponse<UiConfigModel>> => {
		const errors: string[] = [];
		const logs: string[] = [];
		const config = useRuntimeConfig();

		let themesConfig: ThemesConfig | null = null;
		try {
			themesConfig = await new ThemesService().GetThemes();
		} catch (error: any) {
			errors.push("[Uiconfig] GET error: " + error.message);
		}

		const uiConfig: UiConfigModel = {
			themesConfig: themesConfig ?? ThemesConfigDefault,
		};

		// Temporarily output debugging info
		logs.push(
			`hyperdrive.cs: ${config.private.hyperdrive?.connectionString || "--"}`,
		);
		logs.push(`hyperdrive.cs: ${config.private.hyperdrive ?? null}`);

		logs.push(`env_NH: ${process.env?.NUXT_HYPERDRIVE || "--"}`);
		logs.push(
			`env_NH_CS: ${(process.env?.NUXT_HYPERDRIVE as any)?.connectionString || "--"}`,
		);

		return {
			data: uiConfig,
			success: true,
			logs: [...errors, ...logs],
		};
	},
);
