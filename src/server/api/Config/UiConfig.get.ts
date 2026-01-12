import { defineEventHandler, type H3Event } from "h3";
// import {
// 	GetDrizzleConnectionString,
// 	ServerContext,
// } from "~~/server/db/UseDrizzle";
import { ThemesService } from "~~/server/services/ThemesService";
import {
	type ThemesConfig,
	ThemesConfigDefault,
} from "~~/shared/types/ThemeModel";
import type { UiConfigModel } from "~~/shared/types/UiConfigModel";
import { ErrorToString } from "~~/shared/utils/ErrorHelpers";

// GET: /Config/UiConfig
export default defineEventHandler(
	async (event: H3Event): Promise<ApiResponse<UiConfigModel>> => {
		const errors: string[] = [];
		const logs: string[] = [];
		const config = useRuntimeConfig();

		let themesConfig: ThemesConfig | null = null;
		try {
			themesConfig = await new ThemesService().GetThemes();
		} catch (error) {
			errors.push(`[UiConfig] GET error: ${ErrorToString(error)}`);
		}

		const uiConfig: UiConfigModel = {
			themesConfig: themesConfig ?? ThemesConfigDefault,
		};

		// Temporarily output debugging info
		// logs.push(`config.private: ${JSON.stringify(config.private)}`);
		logs.push(`config.public: ${JSON.stringify(config.public)}`);
		logs.push(
			`isCloudflare: ${config.public.environment.runtime == "cloudflare"}`,
		);

		// try {
		// 	// logs.push(
		// 	// 	`Drizzle connection string: ${GetDrizzleConnectionString(event)}`,
		// 	// );
		// 	// logs.push(
		// 	// 	`HYPERDRIVE Cs: ${ServerContext?.cloudflare?.env?.NUXT_HYPERDRIVE?.connectionString}`,
		// 	// );
		// 	// logs.push(
		// 	// 	`HYPERDRIVE Stuff: ${JSON.stringify(ServerContext?.cloudflare?.env?.NUXT_HYPERDRIVE)}`,
		// 	// );
		// 	// logs.push(`ServerContext: ${JSON.stringify(ServerContext)}`);
		// 	// logs.push(`event.context: ${JSON.stringify(event.context)}`);
		// } catch (error) {
		// 	errors.push(`Error: ${ErrorToString(error)}`);
		// }

		return {
			data: uiConfig,
			success: true,
			logs: [...errors, ...logs],
		};
	},
);
