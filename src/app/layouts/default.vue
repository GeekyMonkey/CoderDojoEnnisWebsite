<script setup lang="ts">
const currentPage = ref("ToDo: currentPage");
</script>

<template>

	  <!-- <div style="flex-grow: 1">ToDo: Menu stuff…</div>
							<nuxt-link to="/foo" class="btn width-full"
								><NuxtIcon name="line-md:home" /> foo</nuxt-link>
							<nuxt-link to="/mentor" class="btn width-full"
								><NuxtIcon name="line-md:home" /> mentor</nuxt-link>
							<div class="SidebarFooter">
								<Menubar class="bg-transparent border-0"> -->
		<div class="DashMain">
		<header>
			<h1>{{ currentPage }}</h1>
			<ButtonGroup>
				<ThemeSelect />
				<LanguageSelect />
			</ButtonGroup>
		</header>
		<main>
			<slot />
		</main>
		</div>
</template>

<style lang="scss">
	.Sidebar {
		--SidebarWidth: 300px;

		width: var(--SidebarWidth) !important;
		max-width: 100%;

		.SidebarPanel {
			display: flex;
			flex-direction: column;
			height: 100%;

			.SidebarFooter {
				justify-items: flex-start;
			}
		}
	}
</style>
