<script setup lang="ts">
</script>

<template>
	<div class="MemberLayout">
		<main>
			<slot />
		</main>

		<ButtonGroup>
			<ThemeSelect />
			<LanguageSelect />
		</ButtonGroup>
	</div>
</template>

<style lang="css">
	.MemberLayout {
		display: flex;
		flex-direction: column;
		width: 100%;
		min-height: 100vh;

		main {
			align-content: center;
			flex: 1;
			overflow: auto;
			padding: calc(var(--spacing) * 4);
			width: 100%;
			flex-grow: 1;
		}
	}
</style>
