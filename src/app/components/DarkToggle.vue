<script setup lang="ts">
	import { Button } from "@/components/ui/button";
	import { Icon } from "@iconify/vue";
	import { onMounted } from "vue";

	const colorMode = useColorMode();

	/**
	 * Toggle the color mode
	 */
	const toggleColorMode = () => {
		colorMode.preference = colorMode.preference === "dark" ? "light" : "dark";
		setBodyClass();
	};

	const setBodyClass = () => {
		if (colorMode.preference === "dark") {
			document.body.classList.add("dark");
		} else {
			document.body.classList.remove("dark");
		}
	};

	// Start in the right mode
	onMounted(() => {
		setBodyClass();
	});
</script>

<template>
	<Button class="DarkToggleButton" variant="outline" @click="toggleColorMode">
		<Icon
			v-if="colorMode.preference === 'dark'"
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
