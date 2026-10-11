<script setup lang="ts">
 import { computed, type ComputedRef } from "vue";
 const route: ReturnType<typeof useRoute> = useRoute();
 const memberId: ComputedRef<string> = computed((): string => typeof route.params.memberId === "string" ? route.params.memberId : "");
</script>
<template><MemberDetail :memberId="memberId" /></template>
