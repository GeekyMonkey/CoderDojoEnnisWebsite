<script setup lang="ts">
	import { computed, type ComputedRef } from "vue";
	import type { MemberAttendanceModel } from "#shared/types/models/MemberAttendanceModel";
	import { useMemberAttendanceHistoryStore } from "~/stores/useMemberAttendanceHistoryStore";
	const props = defineProps<{ memberId: string | null }>();
	const { t, locale } = useI18n();
	const { data, isPending, isError } = useMemberAttendanceHistoryStore((): string | null => props.memberId);
	const dates: ComputedRef<string[]> = computed((): string[] => [...new Set((data.value ?? []).map((attendance: MemberAttendanceModel): string => attendance.date))].sort((a: string, b: string): number => b.localeCompare(a)));
 const labels: ComputedRef<Record<string, string>> = computed((): Record<string, string> => {
  const formatter: Intl.DateTimeFormat = new Intl.DateTimeFormat(locale.value, { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
  return Object.fromEntries(dates.value.map((date: string): [string, string] => [date, formatter.format(new Date(`${date}T00:00:00Z`))]));
 });
</script>
<template><UPageCard :title="t('maintenance.attendance')"><p v-if="isPending">{{ t('profile.loading') }}</p><UAlert v-else-if="isError" color="error" :title="t('profile.loadError')" /><template v-else><p>{{ t('maintenance.sessionsCount', { count: dates.length }) }}</p><p v-if="!dates.length">{{ t('maintenance.noAttendance') }}</p><ul><li v-for="date in dates" :key="date"><time :datetime="date">{{ labels[date] }}</time></li></ul></template></UPageCard></template>
<style scoped lang="scss">ul { display: grid; gap: calc(var(--spacing) * 2); max-height: 25rem; overflow: auto; }</style>
