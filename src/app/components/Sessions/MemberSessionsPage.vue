<script setup lang="ts">
 import { useMemberSessionsStore } from "~/stores/useMemberSessionsStore";
 import SessionCard from "~/components/Sessions/SessionCard.vue";
 import ScheduleCalendar from "~/components/Sessions/ScheduleCalendar.vue";
 const props = defineProps<{role:"Coder"|"Parent"}>();
 const { t } = useI18n();
 const { pageTitle } = useMemberLayoutContext();
 const store: ReturnType<typeof useMemberSessionsStore> = useMemberSessionsStore(props.role);
</script>
<template>
 <UDashboardPanel :id="`${role.toLowerCase()}-sessions`">
  <template #header><DashboardHeading :pageTitle="pageTitle" /></template>
  <template #body><div class="MemberSessions">
   <p v-if="store.isPending.value">{{ t('profile.loading') }}</p>
   <UAlert v-else-if="store.isError.value" color="error" :title="t('sessions.loadError')" />
   <ScheduleCalendar v-else-if="!store.data.value?.length" />
   <SessionCard v-for="session in store.data.value ?? []" v-else :key="session.id" :session="session" :joining="store.isJoining.value" :join="store.join" />
  </div></template>
 </UDashboardPanel>
</template>
<style scoped lang="scss">
 .MemberSessions { display: grid; gap: calc(var(--spacing) * 6); padding: calc(var(--spacing) * 4); max-width: 60rem; min-width: 0; }
</style>
