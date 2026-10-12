<script setup lang="ts">
import DataMaintenance from "~/components/Maintenance/DataMaintenance.vue";
const { t }: { t: (key: string) => string } = useI18n();
</script>

<template>
 <UDashboardPanel id="mentor-maintenance-purge-members">
  <template #header><DashboardHeading :pageTitle="t('nav.Purge Members')" /></template>
  <template #body><DataMaintenance action="members" /></template>
 </UDashboardPanel>
</template>
