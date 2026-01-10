<template>
	<div class="ButtonsStack">
		<slot/>
	</div>
</template>

<script setup lang="ts">
</script>

<style scoped>
	.ButtonsStack {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
</style>
