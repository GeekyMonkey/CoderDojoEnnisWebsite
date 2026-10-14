<script setup lang="ts">
import type { CalendarEntry, CalendarView } from "#shared/types/MemberCalendar";
const props: Props = defineProps<Props>();
const emit: PublicCalendarEmits = defineEmits<PublicCalendarEmits>();
type PublicCalendarEmits = { (event: "update:view", view: CalendarView): void; (event: "retry"): void };
type Props = {
  view: CalendarView;
  entries: CalendarEntry[];
  pending: boolean;
  refreshing: boolean;
  failed: boolean;
  cached: boolean;
  displayDate: (date: string) => string;
};
const t: (key: string) => string = useI18n().t;
</script>
<template>
  <section class="public-calendar" :aria-label="t('nav.Calendar')" :aria-busy="props.refreshing">
    <nav class="public-calendar-views" aria-label="Calendar views">
      <button class="button button-small button-outline" type="button" :aria-pressed="props.view === 'future'" @click="emit('update:view', 'future')">{{ t('calendar.future') }}</button>
      <button class="button button-small button-outline" type="button" :aria-pressed="props.view === 'past'" @click="emit('update:view', 'past')">{{ t('calendar.past') }}</button>
    </nav>
    <p v-if="props.pending" role="status">{{ t('calendar.loading') }}</p>
    <div v-if="props.failed" class="notice" role="status">
      <p>{{ t('sessions.loadError') }}</p>
      <p v-if="props.cached">Showing the last loaded calendar.</p>
      <button class="button button-small button-outline" type="button" :disabled="props.refreshing" @click="emit('retry')">Try again</button>
    </div>
    <template v-if="props.cached">
      <p v-if="props.view === 'future'" class="public-calendar-hint">{{ t('calendar.assumedTime') }}</p>
      <p v-if="!props.entries.length" role="status">{{ t('calendar.empty') }}</p>
      <article v-for="(entry, index) in props.entries" :key="entry.id" class="public-calendar-entry" :class="{ 'public-calendar-note': entry.sessionType === 'NOTE', 'public-calendar-next': index === 0 }">
        <p class="public-calendar-label"><span aria-hidden="true">{{ entry.sessionType === 'NOTE' ? '📌' : '💻' }}</span> {{ t(`calendar.types.${entry.sessionType}`) }}
          <strong v-if="index === 0"> · {{ t(props.view === 'future' ? 'calendar.next' : 'calendar.mostRecent') }}</strong>
        </p>
        <h3>{{ entry.topic }}</h3>
        <time :datetime="entry.sessionDate">{{ props.displayDate(entry.sessionDate) }}</time>
        <p v-if="entry.description" class="public-calendar-description">{{ entry.description }}</p>
      </article>
    </template>
  </section>
</template>
