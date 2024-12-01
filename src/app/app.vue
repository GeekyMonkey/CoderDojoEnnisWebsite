<template>
	<NuxtLayout>
		<NuxtPage />
	</NuxtLayout>
</template>

<script setup lang="ts">
	import { NuxtPage, NuxtLayout } from "#components";
	import { useUiConfig } from "./composables/UiConfig";

	// Load the UiConfig as early as possible
	const { UiConfig } = useUiConfig();
</script>

<style lang="scss"></style>
