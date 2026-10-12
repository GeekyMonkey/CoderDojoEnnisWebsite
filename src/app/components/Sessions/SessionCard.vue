<script setup lang="ts">
 import { computed, ref, type ComputedRef, type Ref } from "vue";
 import type { CoderSession, CoderSessionJoined } from "#shared/types/CoderSession";
 import { sessionJoinUrlSchema } from "#shared/types/CoderSession";
 import { useActionNotifications } from "~/composables/useActionNotifications";
 import { requestFailureMessage } from "#shared/utils/RequestFailure";
 import SessionHosts from "./SessionHosts.vue";
 const props = defineProps<{ session: CoderSession; joining: boolean; join: (sessionId: string) => Promise<CoderSessionJoined> }>();
 const { t, locale } = useI18n();
 const { publish } = useActionNotifications();
 const joinedUrl: Ref<string | null> = ref(null);
 const dates: ComputedRef<{ date: string; end: string | null }> = computed((): { date: string; end: string | null } => ({
  date: new Intl.DateTimeFormat(locale.value, { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${props.session.sessionDate}T00:00:00Z`)),
  end: props.session.endsAt === null ? null : new Intl.DateTimeFormat(locale.value, { dateStyle: "medium", timeStyle: "short" }).format(props.session.endsAt),
 }));
 /** Join through the store before opening the validated URL and exposing a popup fallback. */
 async function joinSession(): Promise<void> {
  if (props.joining || props.session.url === null) return;
  try {
   const result: CoderSessionJoined = await props.join(props.session.id);
   joinedUrl.value = sessionJoinUrlSchema.parse(result.url);
   window.open(joinedUrl.value, "_blank", "noopener,noreferrer");
   publish({ name: "session.joined", severity: "success", message: t("sessions.joined") });
  } catch (error: unknown) {
   publish({ name: "session.join.error", severity: "error", message: requestFailureMessage(error) ?? t("sessions.joinError") });
  }
 }
</script>
<template>
 <UPageCard :title="session.topic || t('sessions.label')">
  <time :datetime="session.sessionDate">{{ dates.date }}</time>
  <p v-if="dates.end !== null">{{ t('sessions.ends', { date: dates.end }) }}</p>
  <SessionHosts :hosts="session.hosts" />
  <UButton class="JoinAction" :disabled="session.url === null || joining" :loading="joining" @click="joinSession">{{ t('sessions.join') }}</UButton>
  <p v-if="session.url === null">{{ t('sessions.noUrl') }}</p>
  <p v-else class="SessionUrl">{{ session.url }}</p>
  <a v-if="joinedUrl" :href="joinedUrl" target="_blank" rel="noopener noreferrer" class="FallbackLink">{{ t('sessions.fallback') }}</a>
 </UPageCard>
</template>
<style scoped lang="scss">
 .JoinAction { justify-self: start; align-self: start; width: fit-content; }
 .SessionUrl { overflow-wrap: anywhere; font-size: var(--text-sm); color: var(--ui-text-muted); }
 .FallbackLink { color: var(--ui-primary); text-decoration: underline; }
</style>
