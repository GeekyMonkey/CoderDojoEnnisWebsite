<script setup lang="ts">
	type VexNavLink = {
		to: string;
		label: string;
		icon: string;
	};

	const { t } = useI18n();
	const route = useRoute();

	const links = computed<VexNavLink[]>(() => [
		{ to: "/vex", label: t("nav.VEX Home"), icon: "i-lucide-house" },
		{
			to: "/vex/this-week",
			label: t("nav.This Week"),
			icon: "i-lucide-target",
		},
		{
			to: "/vex/resources",
			label: t("nav.Resources"),
			icon: "i-lucide-library",
		},
	]);
</script>

<template>
	<nav class="VexSectionNav">
		<UButton
			v-for="link in links"
			:key="link.to"
			:to="link.to"
			:icon="link.icon"
			:variant="route.path === link.to ? 'soft' : 'ghost'"
			color="neutral"
			size="sm"
			:aria-label="link.label"
		>
			<span class="VexSectionNavLabel">{{ link.label }}</span>
		</UButton>
	</nav>
</template>

<style scoped lang="scss">
	.VexSectionNav {
		display: flex;
		gap: calc(var(--spacing) * 1);
	}

	@media (max-width: 640px) {
		.VexSectionNavLabel {
			display: none;
		}
	}
</style>
