<script setup lang="ts">
// Load the UiConfig as early as possible
const { UiConfig } = useUiConfig();
</script>

<template>
	<NuxtLayout>
		<UApp>
		<NuxtPage />
		</UApp>
	</NuxtLayout>
	<ThemesThemeFooter />
</template>

<style lang="scss"></style>
