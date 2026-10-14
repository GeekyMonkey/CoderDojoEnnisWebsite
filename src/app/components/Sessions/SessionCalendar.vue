<script setup lang="ts">
	import { computed, ref, type ComputedRef, type Ref } from "vue";
	import type { TabsItem } from "@nuxt/ui";
	import { Temporal } from "temporal-polyfill";
	import {
		SESSION_ICONS,
		type CalendarEntry,
		type CalendarView,
		type MemberCalendar,
	} from "#shared/types/MemberCalendar";
	import { calendarEntriesForView } from "#shared/utils/CalendarEntries";
	import { clubToday } from "#shared/utils/CalendarDates";
	import { useMemberCalendarStore } from "~/stores/useMemberCalendarStore";
	import SessionCard from "./SessionCard.vue";
	import PublicCalendarView from "~/components/Public/PublicCalendarView.vue";
	import { usePublicCalendarStore } from "~/stores/public/usePublicCalendarStore";
	const props = withDefaults(
		defineProps<{
			memberMode?: boolean;
			showPods?: boolean;
			showManagement?: boolean;
		}>(),
		{ memberMode: false, showPods: false, showManagement: false },
	);
	const { t, locale } = useI18n();
	const view: Ref<CalendarView> = ref("future");
	const memberStore: ReturnType<typeof useMemberCalendarStore> | null = props.memberMode
    ? useMemberCalendarStore(view, null, "member") : null;
  const publicStore: ReturnType<typeof usePublicCalendarStore> | null = props.memberMode
    ? null : usePublicCalendarStore(view);
  const calendarData: ComputedRef<MemberCalendar | null> = computed((): MemberCalendar | null =>
    memberStore?.data.value ?? publicStore?.data.value ?? null,
  );
  const isPending: ComputedRef<boolean> = computed((): boolean => memberStore?.isPending.value ?? publicStore?.isPending.value ?? false);
  const isError: ComputedRef<boolean> = computed((): boolean => memberStore?.isError.value ?? publicStore?.isError.value ?? false);
	const tabs: ComputedRef<TabsItem[]> = computed((): TabsItem[] => [
		{
			label: t("calendar.future"),
			value: "future",
			icon: "i-lucide-calendar-arrow-up",
		},
		{ label: t("calendar.past"), value: "past", icon: "i-lucide-history" },
	]);
	const entries: ComputedRef<CalendarEntry[]> = computed((): CalendarEntry[] =>
		calendarEntriesForView(
			calendarData.value?.sessions ?? [],
			view.value,
			calendarData.value?.today ?? clubToday(),
			props.memberMode && memberStore?.isMentor.value === true,
		),
	);
	const canManage: ComputedRef<boolean> = computed(
		(): boolean =>
			props.memberMode && props.showManagement && memberStore?.isMentor.value === true,
	);
	/** Format a date without converting it to the browser timezone. */
	function displayDate(date: string): string {
		return Temporal.PlainDate.from(date).toLocaleString(locale.value, {
			dateStyle: "full",
		});
	}
  // Retry the anonymous query without touching member data or management actions.
  function retryPublicCalendar(): void { void publicStore?.refetch(); }

</script>
<template>
	<PublicCalendarView v-if="!memberMode" :view="view" :entries="entries" :pending="isPending" :failed="isError" :cached="calendarData !== null" :refreshing="publicStore?.isFetching.value ?? false" :displayDate="displayDate" @update:view="view = $event" @retry="retryPublicCalendar" />
  <div v-else class="SessionCalendar">
		<nav
			v-if="canManage"
			class="CalendarActions"
			:aria-label="t('calendar.actions')"
		>
			<UButton
				to="/mentor/sessions/new"
				variant="outline"
				icon="i-lucide-video"
				>{{ t("calendar.addPod") }}</UButton
			><UButton to="/mentor/calendar/new" icon="i-lucide-plus">{{
				t("calendar.addSession")
			}}</UButton>
		</nav>
		<section
			v-if="memberMode && showPods && calendarData?.pods.length"
			class="CalendarSection"
			:aria-label="t('calendar.pods')"
		>
			<h2>{{ t("calendar.pods") }}</h2>
			<div
				v-for="pod in calendarData?.pods ?? []"
				:key="pod.id"
				class="CalendarPod"
				:class="{ CalendarPrivate: pod.mentorsOnly }"
			>
				<SessionCard
					:session="pod"
					:joining="memberStore?.isSaving.value ?? false"
					:join="memberStore!.join"
					><UBadge v-if="pod.mentorsOnly" color="warning">{{
						t("sessions.mentorsOnly")
					}}</UBadge
					><UButton
						v-if="canManage"
						:to="`/mentor/sessions/${pod.id}`"
						variant="outline"
						>{{ t("calendar.editPod") }}</UButton
					></SessionCard
				>
			</div>
		</section>
		<section class="CalendarSection" :aria-label="t('nav.Calendar')">
			<UTabs v-model="view" :items="tabs" class="CalendarTabs"
				><template #content>
					<p v-if="isPending" role="status">
						{{ t("calendar.loading") }}
					</p>
					<UAlert
						v-else-if="isError"
						color="error"
						:title="t('sessions.loadError')"
					/>
					<div
						v-else
						class="CalendarEntries"
						:aria-label="
							t(view === 'future' ? 'calendar.future' : 'calendar.past')
						"
					>
						<p v-if="view === 'future'" class="CalendarHint">
							{{ t("calendar.assumedTime") }}
						</p>
						<p v-if="!entries.length" role="status">
							{{ t("calendar.empty") }}
						</p>
						<article
							v-for="(entry, index) in entries"
							:key="entry.id"
							class="CalendarEntry"
							:class="{
								CalendarNote: entry.sessionType === 'NOTE',
								CalendarPrivate: entry.sessionType === 'MENTOR_PLANNING',
								CalendarHighlighted: index === 0,
							}"
						>
							<div class="CalendarEntryHeading">
								<UIcon
									:name="SESSION_ICONS[entry.sessionType]"
									class="CalendarTypeIcon"
									aria-hidden="true"
								/><span class="CalendarType">{{
									t(`calendar.types.${entry.sessionType}`)
								}}</span
								><UBadge v-if="index === 0" color="primary">{{
									t(view === "future" ? "calendar.next" : "calendar.mostRecent")
								}}</UBadge>
							</div>
							<h3>{{ entry.topic }}</h3>
							<time :datetime="entry.sessionDate">{{
								displayDate(entry.sessionDate)
							}}</time>
							<p v-if="entry.description" class="CalendarDescription">
								{{ entry.description }}
							</p>
							<UButton
								v-if="canManage"
								:to="`/mentor/calendar/${entry.id}`"
								variant="outline"
								class="CalendarAction"
								>{{ t("calendar.editSession") }}</UButton
							>
						</article>
					</div></template
				></UTabs
			>
		</section>
	</div>
</template>
<style scoped lang="scss">
	.SessionCalendar {
		display: grid;
		gap: calc(var(--spacing) * 6);
		padding: calc(var(--spacing) * 4);
		max-width: 60rem;
		min-width: 0;
	}
	.CalendarSection,
	.CalendarEntries {
		display: grid;
		gap: calc(var(--spacing) * 4);
		min-width: 0;
	}
	h2 {
		font-size: var(--text-xl);
		font-weight: 700;
	}
	h3 {
		font-size: var(--text-lg);
		font-weight: 600;
		overflow-wrap: anywhere;
	}
	.CalendarActions,
	.CalendarEntryHeading {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: calc(var(--spacing) * 3);
	}
	.CalendarActions {
		justify-content: flex-end;
	}
	.CalendarEntry {
		display: grid;
		gap: calc(var(--spacing) * 3);
		padding: calc(var(--spacing) * 5);
		background: var(--ui-bg-elevated);
		border: 1px solid var(--ui-border);
		border-radius: var(--ui-radius);
	}
	.CalendarNote {
		background: color-mix(in srgb, var(--ui-info) 13%, var(--ui-bg));
		border-color: var(--ui-info);
	}
	.CalendarPrivate {
		border: 1px solid var(--ui-warning);
		background: color-mix(in srgb, var(--ui-warning) 9%, var(--ui-bg));
		border-radius: var(--ui-radius);
	}
	.CalendarHighlighted {
		border: 2px solid var(--ui-primary);
		box-shadow: 0 0 0 1px color-mix(in srgb, var(--ui-primary) 25%, transparent);
	}
	.CalendarTypeIcon {
		width: 1.25rem;
		height: 1.25rem;
		flex-shrink: 0;
	}
	.CalendarType {
		font-size: var(--text-sm);
		font-weight: 600;
	}
	.CalendarDescription {
		white-space: pre-wrap;
		overflow-wrap: anywhere;
	}
	.CalendarHint,
	time {
		color: var(--ui-text-muted);
	}
	.CalendarAction {
		justify-self: start;
	}
	.CalendarTabs {
		width: 100%;
	}
</style>
