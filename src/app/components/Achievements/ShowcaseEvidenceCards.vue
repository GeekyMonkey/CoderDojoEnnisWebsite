<script setup lang="ts">
	import type { ShowcaseItem } from "#shared/types/Showcase";
	import ShowcaseCard from "~/components/Showcase/ShowcaseCard.vue";
	defineProps<{ items: ShowcaseItem[] }>();
</script>
<template>
	<div v-if="items.length" class="EvidenceProjects">
		<ShowcaseCard v-for="item in items" :key="item.id" :item="item" />
	</div>
</template>
<style scoped lang="scss">
	.EvidenceProjects {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 16rem), 20rem));
		gap: 1rem;
		width: 100%;
	}
</style>
