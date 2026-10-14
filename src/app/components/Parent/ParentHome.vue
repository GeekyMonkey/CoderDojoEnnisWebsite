<script setup lang="ts">
 import ChildrenList from "./ChildrenList.vue";
 const {t} = useI18n();
</script>
<template><UDashboardPanel id="parent-home"><template #header><DashboardHeading :pageTitle="t('nav.Parent Home')" /></template><template #body><div class="ParentHome"><p>{{t('parent.guidance')}}</p><div class="HomeActions"><UButton to="/parent/profile" variant="outline">{{t('profile.title')}}</UButton><UButton to="/parent/kids" variant="outline">{{t('nav.My Kids')}}</UButton><UButton to="/member/calendar" variant="outline">{{t('nav.Calendar')}}</UButton></div><ChildrenList /></div></template></UDashboardPanel></template>
<style scoped lang="scss">.ParentHome{display:grid;gap:calc(var(--spacing)*5);padding:calc(var(--spacing)*4);max-width:60rem;}.HomeActions{display:flex;flex-wrap:wrap;gap:calc(var(--spacing)*3);}</style>
