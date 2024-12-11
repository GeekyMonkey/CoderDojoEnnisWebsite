<template>
	<h2>Mentor Page</h2>

	<TeamsList />
</template>

<script setup lang="ts">
	import { onMounted } from "vue";

	onMounted(() => {
		// Trigger the teams data load
		console.log("Mentor Page Mounted");
	});
</script>

<style lang="scss" scoped></style>
