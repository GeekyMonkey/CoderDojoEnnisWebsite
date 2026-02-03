import { useQuery } from "@tanstack/vue-query";
import {
	FormatBucketFileName,
	FormatBucketFileUrl,
} from "~~/shared/types/Supabase";

// Theme switching is built on @nuxtjs/color-mode for `light`/`dark`/`system`,
// with an additional `theme` attribute for opt-in alternate themes (e.g. `crt`).

let ColorModeService: ReturnType<typeof useColorMode> | null = null;
let IsColorModeInitialized = false;

// Shared across all callers of useUiConfig()
const CustomThemeId = ref<string | null>(null);
const log = useLogger("UiConfig");

const ThemeStorageKey = "coderdojo.theme";

/**
 * Load the UI Config from the server
 */
export function useUiConfig() {
	/**
	 * UI Config Query
	 */
	const {
		data: uiConfig,
		isLoading,
		isError,
		error,
	} = useQuery({
		queryKey: ["UiConfig"],
		queryFn: async ({ signal }) => {
			log.info("Loading UiConfig");
			try {
				const response = await $fetch<ApiResponse<UiConfigModel>>(
					`/api/Config/UiConfig`,
					{ signal },
				);
				if (!response.success) {
					throw new Error(response.error || "api error");
				}
				return response.data;
			} catch (e) {
				log.error("Error loading UiConfig", {}, e);
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
		// 	log.info("UiConfig response", response);
		// },
		// onSuccess: () => {
		// 	log.info("UiConfig loaded successfully");
		// },
		// onRequestError({ request, options, error }) {
		// 	log.error("Request Error loading UiConfig", error);
		// },
	});

	/**
	 * Watch for changes to the UI Config (initial load)
	 */
	watch(uiConfig, (configData) => {
		if (configData) {
			InitColorMode(configData);
		}
	});

	/**
	 * Set the color mode
	 */
	const InitColorMode = (configData: UiConfigModel) => {
		if (IsColorModeInitialized) {
			return;
		}

		const themes = configData.themesConfig.themes || [];
		if (themes.length === 0) {
			return;
		}

		if (!ColorModeService) {
			ColorModeService = useColorMode();
		}

		const applyThemeAttribute = (themeId: string) => {
			if (import.meta.client) {
				type DocumentElementLike = {
					setAttribute?: (name: string, value: string) => void;
				};
				type DocumentLike = {
					documentElement?: DocumentElementLike;
				};
				const root = (globalThis as unknown as { document?: DocumentLike })
					.document?.documentElement;
				root?.setAttribute?.("theme", themeId);
			}
		};

		const loadStoredCustomTheme = () => {
			if (!import.meta.client) {
				return;
			}
			const stored = localStorage.getItem(ThemeStorageKey);
			const isValid = stored && themes.some((t) => t.id === stored);
			CustomThemeId.value = isValid ? stored : null;
			if (stored && !isValid) {
				localStorage.removeItem(ThemeStorageKey);
			}
		};

		// Initialize custom theme from storage (opt-in only)
		loadStoredCustomTheme();

		// Apply initial theme attribute
		const initialThemeId =
			CustomThemeId.value ?? ColorModeService.value ?? "light";
		applyThemeAttribute(initialThemeId);

		// Keep theme attribute in sync with system light/dark unless a custom theme is selected
		watch(
			() => ColorModeService?.value,
			(next) => {
				if (!next) {
					return;
				}
				if (CustomThemeId.value) {
					return;
				}
				applyThemeAttribute(next);
			},
			{ immediate: true },
		);

		IsColorModeInitialized = true;
	};

	/**
	 * Set the theme
	 */
	const SetTheme = (themeName: string) => {
		const themes = uiConfig.value?.themesConfig.themes ?? [];
		const selected = themes.find((t) => t.id === themeName);
		if (!selected) {
			return;
		}

		if (import.meta.client) {
			type DocumentElementLike = {
				setAttribute?: (name: string, value: string) => void;
			};
			type DocumentLike = {
				documentElement?: DocumentElementLike;
			};
			const root = (globalThis as unknown as { document?: DocumentLike })
				.document?.documentElement;
			root?.setAttribute?.("theme", themeName);
		}

		// Standard themes are driven by Nuxt color-mode
		if (themeName === "light" || themeName === "dark") {
			CustomThemeId.value = null;
			if (import.meta.client) {
				localStorage.removeItem(ThemeStorageKey);
			}
			if (ColorModeService) {
				ColorModeService.preference = themeName;
			}
			return;
		}

		// Alternate themes (e.g. crt) are opt-in and persisted separately.
		CustomThemeId.value = themeName;
		if (import.meta.client) {
			localStorage.setItem(ThemeStorageKey, themeName);
		}

		// Keep Nuxt UI on a sensible baseline (light/dark) based on the selected theme.
		if (ColorModeService) {
			ColorModeService.preference = selected.darkOrLight;
		}
	};

	/**
	 * Get the current theme
	 */
	const CurrentTheme = computed<ThemeModel | null>(() => {
		const themes = uiConfig.value?.themesConfig.themes ?? [];
		const themeId = CustomThemeId.value ?? ColorModeService?.value ?? "";
		return themes.find((t) => t.id === themeId) ?? null;
	});

	/**
	 * Format a full bucket image URL
	 */
	const BucketImageUrl = (
		folder: string,
		prefix: string,
		id: string,
	): string => {
		const bucketBaseUrl: string = uiConfig.value?.bucketBaseUrl ?? "";
		return FormatBucketFileUrl(
			bucketBaseUrl,
			folder,
			FormatBucketFileName(prefix, id, "jpg"),
		);
	};

	/**
	 * Get the badge category logo URL
	 */
	const BadgeCategoryLogoUrl = (categoryId: string): string => {
		return BucketImageUrl("BadgeCategories", "BadgeCategory", categoryId);
	};

	/**
	 * Get the member avatar URL
	 */
	const MemberAvatarUrl = (memberId: string): string => {
		return BucketImageUrl("Members/Avatars", "Member", memberId);
	};

	/**
	 * Get the member photo URL
	 */
	const MemberPhotoUrl = (memberId: string): string => {
		return BucketImageUrl("Members/Photos", "Member", memberId);
	};

	/**
	 * Get the team logo URL
	 */
	const TeamLogoUrl = (teamId: string): string => {
		return BucketImageUrl("Teams", "Team", teamId);
	};

	return {
		BadgeCategoryLogoUrl,
		BucketImageUrl,
		CurrentTheme,
		isLoading,
		isError,
		error,
		MemberAvatarUrl,
		MemberPhotoUrl,
		TeamLogoUrl,
		SetTheme,
		ThemesConfig: computed<ThemesConfig | null>(() => {
			return uiConfig.value?.themesConfig ?? null;
		}),
		UiConfig: uiConfig,
	};
}
