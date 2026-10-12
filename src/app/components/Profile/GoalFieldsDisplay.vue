<script setup lang="ts">
 const props = defineProps<{member:{goalShortTerm:string|null;goalLongTerm:string|null}}>();
 const KEYS:("goalShortTerm"|"goalLongTerm")[] = ["goalShortTerm","goalLongTerm"];
 const {t} = useI18n();
</script>
<template><dl class="Goals"><div v-for="key in KEYS" :key="key"><dt>{{t(`maintenance.${key}`)}}</dt><dd>{{member[key] || t('profile.noGoal')}}</dd></div></dl></template>
<style scoped lang="scss">.Goals{display:grid;gap:calc(var(--spacing)*4);}.Goals dt{font-weight:600;}.Goals dd{margin:0;white-space:pre-wrap;overflow-wrap:anywhere;}</style>
