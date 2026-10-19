<script setup lang="ts">
	import { computed, type ComputedRef } from "vue";
	import MemberProfilePage from "~/components/Profile/MemberProfilePage.vue";
	const route: ReturnType<typeof useRoute> = useRoute();
	const memberId: ComputedRef<string> = computed((): string => typeof route.params.memberId === "string" ? route.params.memberId : "");
</script>

<template><MemberProfilePage :key="memberId" :memberId="memberId" /></template>
