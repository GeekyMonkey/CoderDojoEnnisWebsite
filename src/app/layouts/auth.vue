<script setup lang="ts"></script>

<template>
	<div class="AuthLayout">
		<main>
			<slot />
		</main>

		<div class="Footer">
			<ThemesSelect />
			<LanguageSelect />
		</div>
	</div>
</template>

<style lang="scss">
	.AuthLayout {
		display: flex;
		flex-direction: column;
		width: 100%;
		min-height: 100vh;

		main {
			flex: 1;
			padding: 1rem;
			width: 100%;
			flex-grow: 1;
			align-content: center;
			justify-items: center;
		}

		.Footer {
			display: flex;
			padding: 1rem;
			gap: 1rem;
			width: 100%;
		}
	}
</style>
