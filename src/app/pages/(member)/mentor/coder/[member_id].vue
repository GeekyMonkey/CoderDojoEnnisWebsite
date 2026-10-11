<script setup lang="ts">
 import { computed, type ComputedRef } from "vue";
 const route: ReturnType<typeof useRoute> = useRoute();
 const memberId: ComputedRef<string> = computed((): string => typeof route.params.member_id === "string" ? route.params.member_id : "");
</script>
<template><MemberDetail :memberId="memberId" /></template>
