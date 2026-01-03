<script setup lang="ts">
	const { CurrentTheme } = useUiConfig();
	const currentThemeName = computed<string>(() => CurrentTheme.value?.id || "");
</script>

<template>
	<Teleport to="body">
		<div id="ThemeFooter" :data-theme="currentThemeName">
			<Theme _crt v-if="currentThemeName === 'crt'"/>
		</div>
	</Teleport>
</template>

<style lang="scss">
	#ThemeFooter {
		z-index: 60; // Appear above sidebar
		position: absolute;
		inset: 0;
		pointer-events: none;
	}
</style>
