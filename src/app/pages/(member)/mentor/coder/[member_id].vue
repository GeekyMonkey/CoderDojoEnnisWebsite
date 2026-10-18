<script setup lang="ts">
 const route:ReturnType<typeof useRoute> = useRoute();
 const id:string = typeof route.params.member_id === "string" ? route.params.member_id : "";
 await navigateTo(`/member/member/${id}`, {replace:true});
</script>
<template><span /></template>
