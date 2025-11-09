<script setup lang="ts">

</script>

<template>
	<div class="AuthLayout flex min-h-screen w-full">

		<main class="flex-1 overflow-auto p-4 width-full grow">
			<slot />
		</main>

		<ButtonGroup>
			<ThemeSelect />
			<LanguageSelect />
		</ButtonGroup>
	</div>
</template>

<style lang="scss">
.AuthLayout {
	display: flex;
	flex-direction: column;

	main {
		align-content: center;
	}
}
</style>
