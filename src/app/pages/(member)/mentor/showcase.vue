<script setup lang="ts">
	import ShowcaseManagement from "~/components/Showcase/ShowcaseManagement.vue";
	const route: ReturnType<typeof useRoute> = useRoute();
	const memberId: ComputedRef<string | undefined> = computed(
		(): string | undefined =>
			typeof route.query.memberId === "string"
				? route.query.memberId
				: undefined,
	);
</script>
<template><ShowcaseManagement :memberId="memberId" /></template>
