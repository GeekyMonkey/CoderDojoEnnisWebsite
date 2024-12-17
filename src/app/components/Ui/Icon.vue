<script setup lang="ts">
	defineProps<{
		icon: string;
	}>();
</script>

<template>
	<div class="UiIcon">
		<NuxtIcon :name="icon" />
	</div>
</template>

<style lang="scss" scoped>
	.UiIcon {
		line-height: 1;
	}
</style>
