<script setup lang="ts">
	import { Button } from "@/components/ui/button";
	import { Icon } from "@iconify/vue";
	import { useColorMode } from "@vueuse/core";
	import { ref, watch } from "vue";
	import { useUiConfig } from "~/composables/UiConfig";
	import type { ThemeModel } from "~~/shared/types/ThemeModel";

	const { UiConfig, SetTheme, CurrentTheme } = useUiConfig();
	let colorModeIndex = 0;
	const themes = ref<ThemeModel[]>([]);

	/**
	 * Toggle the color mode
	 */
	const toggleColorMode = () => {
		const themes = UiConfig.value?.themesConfig.themes ?? [];
		colorModeIndex = (colorModeIndex + 1) % themes.length;
		const newColorMode: string = themes[colorModeIndex]?.folder!;
		console.log(
			"DarkToggle.vue: toggleColorMode: newColorMode:",
			themes[colorModeIndex]?.themeName.fr,
		);
		SetTheme(newColorMode);
	};
</script>

<template>
	<Button class="DarkToggleButton" variant="outline" @click="toggleColorMode">
		<Icon
			v-if="CurrentTheme.value === 'neon'"
			icon="line-md:sunny-filled-loop-to-moon-filled-alt-loop-transition"
			class="ToggleIcon w-5 h-5"
		/>
		<Icon
			v-else
			icon="line-md:moon-filled-to-sunny-filled-loop-transition"
			class="ToggleIcon w-5 h-5"
		/>
		<span class="sr-only">Toggle theme</span>
	</Button>
</template>

<style scoped lang="scss">
	.DarkToggleButton {
	}
</style>
