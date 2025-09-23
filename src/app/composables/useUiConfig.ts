import { useColorMode, type UseColorModeReturn } from "@vueuse/core";
import { useQuery } from '@tanstack/vue-query'

let ColorModeService: UseColorModeReturn<string> | null = null;

/**
 * Load the UI Config from the server
 */
export function useUiConfig() {
	/**
	 * UI Config Query
	 */
	const { data, isLoading, isError, error } = useQuery({
		queryKey: ["UiConfig"],
		queryFn: async ({ signal }) => {
			console.log("Loading UiConfig");
			try {
				const response = await $fetch<ApiResponse<UiConfigModel>>(
					`/api/Config/UiConfig`,
					{ signal },
				);
				if (!response.success) {
					debugger;
					throw new Error(response.error || "api error");
				}
				return response.data;
			} catch (e) {
				console.error("Error loading UiConfig", e);
				debugger;
				throw e;
			}
		},
		retry: 2,
		retryDelay: 500,
		staleTime: Infinity,
		gcTime: Infinity,
		enabled: true,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		refetchInterval: false,
		refetchOnMount: false,
		refetchIntervalInBackground: false,
		// onResponse: (response) => {
		// 	console.log("UiConfig response", response);
		// },
		// onSuccess: () => {
		// 	console.log("UiConfig loaded successfully");
		// },
		// onRequestError({ request, options, error }) {
		// 	console.error("Request Error loading UiConfig", error);
		// },
	});

	/**
	 * Watch for changes to the UI Config (initial load)
	 */
	watch(data, (configData) => {
		if (configData) {
			InitColorMode(configData);
		}
	});

	/**
	 * Set the color mode
	 */
	const InitColorMode = (configData: UiConfigModel) => {
		const themes = configData.themesConfig.themes || [];
		if (themes.length > 0) {
			// Custom color modes = themes
			const colorModesObj = themes.reduce(
				(acc: Record<string, string>, mode: ThemeModel) => {
					acc[mode.id] = mode.id;
					return acc;
				},
				{},
			);
			ColorModeService = useColorMode({
				modes: colorModesObj,
				attribute: "theme",
			});

			// Set the default color mode
			switch (ColorModeService.value) {
				case "auto":
				case "dark":
					SetTheme(configData.themesConfig.defaultDarkThemeId);
					break;
				case "light":
					SetTheme(configData.themesConfig.defaultLightThemeId);
					break;
				default:
				// Stick with known theme
			}
		}
	};

	/**
	 * Set the theme
	 */
	const SetTheme = (themeName: string) => {
		if (ColorModeService) {
			ColorModeService.value = themeName;
		}
	};

	/**
	 * Get the current theme
	 */
	const CurrentTheme = computed<ThemeModel | null>(() => {
		if (ColorModeService) {
			const themeId = ColorModeService.value;
			return (
				data.value?.themesConfig.themes.find((t) => t.id === themeId) ??
				null
			);
		}
		return null;
	});

	return {
		CurrentTheme,
		isLoading,
		isError,
		error,
		SetTheme,
		ThemesConfig: computed<ThemesConfig | null>(() => {
			return data.value?.themesConfig ?? null;
		}),
		UiConfig: data,
	};
}
