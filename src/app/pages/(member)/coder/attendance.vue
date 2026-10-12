<script setup lang="ts">
 import MemberAttendanceHistory from "~/components/Maintenance/MemberAttendanceHistory.vue";
 const { pageTitle } = useMemberLayoutContext();
</script>
<template>
 <UDashboardPanel id="coder-attendance">
  <template #header><DashboardHeading :pageTitle="pageTitle" /></template>
  <template #body><div class="CoderAttendance"><MemberAttendanceHistory :memberId="null" /></div></template>
 </UDashboardPanel>
</template>
<style scoped lang="scss">
 .CoderAttendance { padding:calc(var(--spacing) * 4); max-width:60rem; }
</style>
