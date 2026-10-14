<script setup lang="ts">
	import { computed, type ComputedRef } from "vue";
	import CalendarSessionEditor from "~/components/Sessions/CalendarSessionEditor.vue";
	const route: ReturnType<typeof useRoute> = useRoute();
	const sessionId: ComputedRef<string> = computed((): string =>
		String(route.params.sessionId),
	);
</script>
<template>
	<CalendarSessionEditor :key="sessionId" :sessionId="sessionId" />
</template>
