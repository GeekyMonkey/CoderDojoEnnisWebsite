<template>
	<h2>Mentor Page</h2>

	<h3>Teams</h3>
	<TeamsList />
</template>

<script setup lang="ts">
	import { onMounted } from "vue";
	import { useTeamsStore } from "~/composables/TeamsStore";

	const { Teams } = useTeamsStore();

	onMounted(() => {
		// Trigger the teams data load
		console.log("Mentor Page Mounted");
	});
</script>

<style lang="scss" scoped></style>
