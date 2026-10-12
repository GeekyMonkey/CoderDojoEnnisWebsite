<script setup lang="ts">
import DataMaintenance from "~/components/Maintenance/DataMaintenance.vue";
const { t }: { t: (key: string) => string } = useI18n();
</script>

<template>
 <UDashboardPanel id="mentor-maintenance-purge-registrations">
  <template #header><DashboardHeading :pageTitle="t('nav.Purge Registrations')" /></template>
  <template #body><DataMaintenance action="registrations" /></template>
 </UDashboardPanel>
</template>
