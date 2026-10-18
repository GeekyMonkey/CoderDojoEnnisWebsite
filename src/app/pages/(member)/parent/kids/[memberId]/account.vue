<script setup lang="ts">
 const route:ReturnType<typeof useRoute> = useRoute();
 const id:string = typeof route.params.memberId === "string" ? route.params.memberId : "";
 await navigateTo({path:`/member/member/${id}`,query:{tab:"details"}}, {replace:true});
</script>
<template><span /></template>
