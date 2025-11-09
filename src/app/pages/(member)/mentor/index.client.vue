<script setup lang="ts">
const log = useLogger("MentorPage");

onMounted(() => {
	// Trigger the teams data load
	log.info("Mounted");
});
</script>

<template>
	<h2>Mentor Page</h2>

	<TeamsList />
</template>

<style lang="scss" scoped></style>
