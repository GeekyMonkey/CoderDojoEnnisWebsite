<template>
	<div class="AuthLayout flex min-h-screen w-full">
		<main class="flex-1 overflow-auto p-4 width-full flex-grow">
			<slot />
		</main>

		<Menubar class="bg-transparent border-0">
			<ThemeSelect />
			<LanguageSelect />
		</Menubar>
	</div>
</template>

<script setup lang="ts">
	import LanguageSelect from "~/components/LanguageSelect.client.vue";
</script>

<style lang="scss">
	.AuthLayout {
		display: flex;
		flex-direction: column;

		main {
			align-content: center;
		}
	}
</style>
