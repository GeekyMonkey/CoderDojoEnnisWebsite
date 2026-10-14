<script setup lang="ts">
	import {
		reactive,
		ref,
		computed,
		watch,
		type Ref,
		type ComputedRef,
	} from "vue";
	import { z } from "zod";
	import {
		calendarFieldsSchema,
		type CalendarFields,
		type CalendarSession,
		type SessionType,
		DEFAULT_TOPICS,
		SESSION_ICONS,
	} from "#shared/types/MemberCalendar";
	import { clubToday } from "#shared/utils/CalendarDates";
	import { requestFailureMessage } from "#shared/utils/RequestFailure";
	import { useMemberCalendarStore } from "~/stores/useMemberCalendarStore";
	const props = defineProps<{ sessionId: string | null }>();
	const { t } = useI18n();
	const store: ReturnType<typeof useMemberCalendarStore> =
		useMemberCalendarStore("future", () => props.sessionId);
	const fields: CalendarFields = reactive({
		sessionDate: clubToday(),
		topic: "Coding Session",
		description: "",
		sessionType: "CODING",
	});
	const typeOptions: ComputedRef<
		{ label: string; value: SessionType; icon: string }[]
	> = computed((): { label: string; value: SessionType; icon: string }[] =>
		(["CODING", "MENTOR_PLANNING", "NOTE"] as const).map(
			(
				value: SessionType,
			): { label: string; value: SessionType; icon: string } => ({
				value,
				label: t(`calendar.types.${value}`),
				icon: SESSION_ICONS[value],
			}),
		),
	);
	const baseline: Ref<string | null> = ref(null);
	const deleteRevision: Ref<string | null> = ref(null);
	const errorMessage: Ref<string> = ref("");
	const valid: ComputedRef<boolean> = computed(
		(): boolean =>
			props.sessionId === null || z.uuid().safeParse(props.sessionId).success,
	);
	const stale: ComputedRef<boolean> = computed(
		(): boolean =>
			baseline.value !== null &&
			baseline.value !== store.session.value?.revision,
	);
	/** Save only the revision originally loaded, preserving drafts across realtime changes. */
	async function save(): Promise<void> {
		errorMessage.value = "";
		try {
			const values: CalendarFields = calendarFieldsSchema.parse(fields);
			if (props.sessionId === null) await store.create(values);
			else if (baseline.value !== null)
				await store.save(props.sessionId, {
					fields: values,
					expected: baseline.value,
				});
			await navigateTo("/member/calendar");
		} catch (error: unknown) {
			errorMessage.value =
				requestFailureMessage(error) ?? t("sessions.saveError");
		}
	}
	/** Delete only the exact revision whose removal was confirmed. */
	async function remove(): Promise<void> {
		if (props.sessionId === null || deleteRevision.value === null) return;
		try {
			await store.remove(props.sessionId, { expected: deleteRevision.value });
			await navigateTo("/member/calendar");
		} catch (error: unknown) {
			errorMessage.value =
				requestFailureMessage(error) ?? t("sessions.saveError");
		}
	}
	/** Keep custom topics while following the selected type's untouched default. */
	function changeSessionType(value: SessionType): void {
		if (fields.topic === DEFAULT_TOPICS[fields.sessionType])
			fields.topic = DEFAULT_TOPICS[value];
		fields.sessionType = value;
	}
	/** Initialise a draft once without overwriting unsaved fields during refresh. */
	watch(
		store.session,
		(session: CalendarSession | null): void => {
			if (session !== null && baseline.value === null) {
				Object.assign(fields, {
					sessionDate: session.sessionDate,
					topic: session.topic,
					description: session.description,
					sessionType: session.sessionType,
				});
				baseline.value = session.revision;
			}
		},
		{ immediate: true },
	);
</script>
<template>
	<UDashboardPanel id="calendar-session-editor"
		><template #header
			><DashboardHeading
				:pageTitle="
					t(sessionId === null ? 'calendar.addSession' : 'calendar.editSession')
				"
				:breadcrumbLabel="t('nav.Calendar')"
				breadcrumbTo="/member/calendar" /></template
		><template #body
			><div class="CalendarEditor">
				<UAlert
					v-if="!store.isMentor.value"
					color="error"
					:title="t('calendar.mentorRequired')"
				/>
				<p v-else-if="sessionId !== null && valid && store.detailPending.value">
					{{ t("calendar.loading") }}
				</p>
				<UAlert
					v-else-if="!valid || (sessionId !== null && store.detailError.value)"
					color="error"
					:title="t('sessions.notFound')"
				/>
				<template v-else
					><UAlert
						v-if="errorMessage"
						color="error"
						:title="errorMessage"
					/><UAlert
						v-if="stale"
						color="warning"
						:title="t('profile.remoteChanged')"
					/>
					<UForm
						:schema="calendarFieldsSchema"
						:state="fields"
						class="CalendarForm"
						@submit="save"
						><UFormField name="sessionDate" :label="t('calendar.date')" required
							><UInput v-model="fields.sessionDate" type="date" /></UFormField
						><UFormField name="topic" :label="t('calendar.topic')"
							><UInput v-model="fields.topic" :maxlength="200" /></UFormField
						><UFormField name="description" :label="t('calendar.description')"
							><UTextarea
								v-model="fields.description"
								:maxlength="4000"
								:rows="5"
								class="CalendarText"
						/></UFormField>
						<UFormField name="sessionType" :label="t('calendar.sessionType')"
							><USelect
								:modelValue="fields.sessionType"
								@update:modelValue="changeSessionType"
								:items="typeOptions"
								class="CalendarText"
						/></UFormField>
						<div class="CalendarEditorActions">
							<UButton
								type="submit"
								:disabled="stale"
								:loading="store.isSaving.value"
								>{{ t("calendar.save") }}</UButton
							><UButton to="/member/calendar" variant="outline">{{
								t("profile.cancel")
							}}</UButton>
						</div></UForm
					>
					<UButton
						v-if="sessionId !== null && !deleteRevision"
						color="error"
						variant="outline"
						class="CalendarDelete"
						:disabled="stale || store.isSaving.value"
						@click="deleteRevision = baseline"
						>{{ t("calendar.deleteSession") }}</UButton
					>
					<UPageCard v-if="deleteRevision" :title="t('calendar.deleteConfirm')"
						><div class="CalendarEditorActions">
							<UButton
								color="error"
								:disabled="stale"
								:loading="store.isSaving.value"
								@click="remove"
								>{{ t("calendar.deleteSession") }}</UButton
							><UButton variant="outline" @click="deleteRevision = null">{{
								t("profile.cancel")
							}}</UButton>
						</div></UPageCard
					>
				</template>
			</div></template
		></UDashboardPanel
	>
</template>
<style scoped lang="scss">
	.CalendarEditor {
		display: grid;
		gap: calc(var(--spacing) * 5);
		max-width: 45rem;
		padding: calc(var(--spacing) * 4);
	}
	.CalendarForm {
		display: grid;
		gap: calc(var(--spacing) * 4);
	}
	.CalendarText {
		width: 100%;
	}
	.CalendarEditorActions {
		display: flex;
		flex-wrap: wrap;
		gap: calc(var(--spacing) * 3);
	}
	.CalendarDelete {
		justify-self: start;
	}
</style>
