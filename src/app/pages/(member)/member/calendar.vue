<script setup lang="ts">
	import SessionCalendar from "~/components/Sessions/SessionCalendar.vue";
	const { t } = useI18n();
</script>
<template>
	<UDashboardPanel id="member-calendar"
		><template #header
			><DashboardHeading :pageTitle="t('nav.Calendar')" /></template
		><template #body
			><SessionCalendar memberMode showPods showManagement /></template
	></UDashboardPanel>
</template>
