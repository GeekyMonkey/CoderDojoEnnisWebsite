<script setup lang="ts">
 const route:ReturnType<typeof useRoute> = useRoute();
 const id:string = typeof route.params.memberId === "string" ? route.params.memberId : "";
 await navigateTo(`/member/member/${id}`, {replace:true});
</script>
<template><span /></template>
