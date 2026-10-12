<script setup lang="ts">import GoalFieldsDisplay from "./GoalFieldsDisplay.vue";const props = defineProps<{member:{goalShortTerm:string|null;goalLongTerm:string|null}}>();const {t} = useI18n();</script>
<template><UPageCard :title="t('maintenance.goals')"><GoalFieldsDisplay :member="member" /></UPageCard></template>
