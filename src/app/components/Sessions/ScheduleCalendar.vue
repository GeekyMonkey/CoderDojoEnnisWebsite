<script setup lang="ts">
 const { t } = useI18n();
 const CALENDAR_URL: string = "https://www.google.com/calendar/embed?title=Ennis%20Coder%20Dojo&mode=AGENDA&height=600&wkst=2&bgcolor=%23228822&src=enniscoderdojo%40gmail.com&color=%23125A12&ctz=Europe%2FDublin";
</script>
<template>
 <section class="ScheduleCalendar"><p>{{ t('sessions.empty') }}</p><a :href="CALENDAR_URL" target="_blank" rel="noopener noreferrer">{{ t('sessions.calendar') }}</a><iframe :src="CALENDAR_URL" :title="t('sessions.calendar')" loading="lazy" referrerpolicy="no-referrer" /></section>
</template>
<style scoped lang="scss">
 .ScheduleCalendar { display: grid; gap: calc(var(--spacing) * 4); }
 a { color: var(--ui-primary); text-decoration: underline; }
 iframe { width: 100%; height: 37.5rem; border: 0; border-radius: var(--ui-radius); background: var(--ui-bg); }
</style>
