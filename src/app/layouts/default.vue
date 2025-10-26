<script setup lang="ts">
const currentPage = ref("ToDo: currentPage");
</script>

<template>
	<div class="flex h-screen w-full">
		<div class="flex flex-col flex-1 overflow-hidden">
			<header
				class="flex items-center justify-between px-4 py-2 bg-background border-b"
			>
				<Sheet>
					<SheetTrigger asChild>
						<Button>
							<NuxtIcon name="line-md:menu" />
						</Button>
					</SheetTrigger>
					<SheetContent side="left" class="Sidebar">
						<div class="SidebarPanel">
							<div style="flex-grow: 1">ToDo: Menu stuff…</div>
							<nuxt-link to="/foo" class="btn width-full"
								><NuxtIcon name="line-md:home" /> foo</nuxt-link>
							<nuxt-link to="/mentor" class="btn width-full"
								><NuxtIcon name="line-md:home" /> mentor</nuxt-link>
							<div class="SidebarFooter">
								<Menubar class="bg-transparent border-0">
									<ThemeSelect />
									<LanguageSelect />
								</Menubar>
							</div>
						</div>
					</SheetContent>
				</Sheet>

				<h1 class="text-xl font-semibold">{{ currentPage }}</h1>
			</header>
			<main class="flex-1 overflow-auto p-4 width-full flex-grow">
				<slot />
			</main>
		</div>
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
