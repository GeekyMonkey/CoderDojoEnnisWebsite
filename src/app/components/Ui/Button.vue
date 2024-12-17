<script setup lang="ts">
	withDefaults(
		defineProps<{
			icon?: string;
			type?: "button" | "submit";
		}>(),
		{
			icon: "",
			type: "button",
		},
	);
</script>

<template>
	<button class="button UiButton" :type="type">
		<UiIcon v-if="icon" :icon="icon" />
		<slot></slot>
	</button>
</template>

<style lang="scss" scoped>
	.UiButton {
	}
</style>
