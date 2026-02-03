<template>
	<nav class="ButtonGroup">
		<slot />
	</nav>
</template>

<script setup lang="ts"></script>

<style scoped>
	.ButtonGroup {
		display: flex;
		gap: 0.75rem;
		align-items: center;
	}
</style>
