<script setup lang="ts">
 import { ACTION_TOASTER } from "~/utils/actionNotificationPolicy";
	const log = useLogger("App.vue");
	log.info("App.vue initialized");

	// Load the UiConfig as early as possible
	const { UiConfig } = useUiConfig();

	// watch(
	// 	UiConfig,
	// 	(newConfig) => {
	// 		if (newConfig) {
	// 			log.info("Loaded with themesConfig:", {
	// 				themesConfig: UiConfig.value?.themesConfig,
	// 			});
	// 		}
	// 	},
	// 	{ immediate: true },
	// );
</script>

<template>
	<UApp :toaster="ACTION_TOASTER">
  <ActionNotificationPresenter />
		<NuxtLoadingIndicator />

		<NuxtLayout>
			<NuxtPage />
		</NuxtLayout>
	</UApp>
	<ThemeFooter />
</template>

<style lang="css"></style>
