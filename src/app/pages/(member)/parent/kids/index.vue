<script setup lang="ts">import ChildrenList from "~/components/Parent/ChildrenList.vue"; const {t} = useI18n();</script>
<template><UDashboardPanel id="parent-children"><template #header><DashboardHeading :pageTitle="t('nav.My Kids')" /></template><template #body><div class="ChildDirectory"><ChildrenList /></div></template></UDashboardPanel></template>
<style scoped lang="scss">.ChildDirectory{padding:calc(var(--spacing)*4);max-width:60rem;}</style>
