<script setup lang="ts"></script>

<template>
	<div class="StatsLayout flex min-h-screen w-full">
		<main class="flex-1 overflow-auto p-4 width-full flex-grow">
			<slot />
		</main>

		<ButtonGroup>
			<ThemeSelect />
			<LanguageSelect />
		</ButtonGroup>
	</div>
</template>

<style lang="scss">
	.StatsLayout {
		display: flex;
		flex-direction: column;

		main {
			align-content: center;
		}
	}
</style>
