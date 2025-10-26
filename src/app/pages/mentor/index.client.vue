<script setup lang="ts">
onMounted(() => {
	// Trigger the teams data load
	console.log("Mentor Page Mounted");
});
</script>

<template>
	<h2>Mentor Page</h2>

	<TeamsList />
</template>

<style lang="scss" scoped></style>
