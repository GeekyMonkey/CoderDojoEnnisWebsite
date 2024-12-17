<script setup lang="ts">
	const { CurrentTheme } = useUiConfig();
	const currentThemeName = computed<string>(
		() => CurrentTheme.value?.id || "",
	);
</script>

<template>
	<Teleport to="body">
		<!-- Specialty Themes with HTML/Script needs go here -->
		<div id="ThemeLayoutFooter" :data-theme="currentThemeName">
			<ThemesTheme_crt v-if="currentThemeName === 'crt'" />
		</div>
	</Teleport>
</template>

<style lang="scss">
	#ThemeLayoutFooter {
		z-index: 60; // Appear above sidebar
		position: absolute;
		inset: 0;
		pointer-events: none;
	}
</style>
