<script setup lang="ts">
</script>

<template>
	<div class="AuthLayout">
		<main>
			<slot />
		</main>

		<UFooter>
			<template #left>
				<ButtonGroup>
					<ThemeSelect />
					<LanguageSelect />
				</ButtonGroup>
			</template>
		</UFooter>
	</div>
</template>

<style lang="css">
	.AuthLayout {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		width: 100%;

		main {
			display: flex;
			align-items: center;
			justify-content: center;
			padding: calc(var(--spacing) * 4);
			width: 100%;
			flex-grow: 1;
			overflow: auto;
		}
	}
</style>
