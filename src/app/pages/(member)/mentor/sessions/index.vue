<script setup lang="ts">
 import { computed, ref, type ComputedRef, type Ref } from "vue";
 import type { ManagedSession } from "#shared/types/SessionMaintenance";
 import { useSessionManagementStore } from "~/stores/useSessionManagementStore";
 import { useCurrentTime } from "~/composables/useCurrentTime";
 import SessionCard from "~/components/Sessions/SessionCard.vue";
 import ScheduleCalendar from "~/components/Sessions/ScheduleCalendar.vue";
 const { t } = useI18n();
 const { pageTitle } = useMemberLayoutContext();
 const store: ReturnType<typeof useSessionManagementStore> = useSessionManagementStore();
 const showEnded: Ref<boolean> = ref(false);
 const now: Ref<number> = useCurrentTime();
 const pods: ComputedRef<ManagedSession[]> = computed((): ManagedSession[] => {
  const today: string = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Dublin", year: "numeric", month: "2-digit", day: "2-digit" }).format(now.value);
  return (store.data.value?.pods ?? []).filter((pod: ManagedSession): boolean => showEnded.value || (pod.endsAt === null ? pod.sessionDate >= today : pod.endsAt > now.value));
 });
</script>
<template>
 <UDashboardPanel id="mentor-sessions">
  <template #header><DashboardHeading :pageTitle="pageTitle"><template #right><UButton to="/mentor/sessions/new" icon="i-lucide-plus">{{ t('sessions.new') }}</UButton></template></DashboardHeading></template>
  <template #body><div class="MentorSessions"><UCheckbox v-model="showEnded" :label="t('sessions.showEnded')" /><p v-if="store.isPending.value">{{ t('profile.loading') }}</p><UAlert v-else-if="store.isError.value" color="error" :title="t('sessions.loadError')" /><ScheduleCalendar v-else-if="!pods.length" /><template v-else><SessionCard v-for="pod in pods" :key="pod.id" :session="pod" :joining="store.isSaving.value" :join="store.join"><UCheckbox :modelValue="pod.fields.mentorsOnly" disabled :label="t('sessions.mentorsOnly')" /><UButton :to="`/mentor/sessions/${pod.id}`" variant="outline" class="EditAction">{{ t('profile.edit') }}</UButton></SessionCard></template></div></template>
 </UDashboardPanel>
</template>
<style scoped lang="scss">.MentorSessions { display: grid; gap: calc(var(--spacing) * 5); padding: calc(var(--spacing) * 4); max-width: 60rem; } .EditAction { justify-self: start; align-self: start; width: fit-content; }</style>
