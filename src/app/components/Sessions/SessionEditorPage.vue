<script setup lang="ts">
	import { computed, ref, type ComputedRef, type Ref } from "vue";
	import { z } from "zod";
	import type {
		ManagedSession,
		SessionFields,
		SessionSnapshot,
	} from "#shared/types/SessionMaintenance";
	import { useSessionManagementStore } from "~/stores/useSessionManagementStore";
	import { useActionNotifications } from "~/composables/useActionNotifications";
	import { requestFailureMessage } from "#shared/utils/RequestFailure";
	import SessionForm from "./SessionForm.vue";
	import SessionCard from "./SessionCard.vue";
	const props = defineProps<{ sessionId: string | null }>();
	const { t } = useI18n();
	const { publish } = useActionNotifications();
	const store: ReturnType<typeof useSessionManagementStore> =
		useSessionManagementStore();
	const editing: Ref<boolean> = ref(props.sessionId === null);
	const deleteSnapshot: Ref<SessionSnapshot | null> = ref(null);
	const session: ComputedRef<ManagedSession | null> = computed(
		(): ManagedSession | null =>
			store.data.value?.pods.find(
				(pod: ManagedSession): boolean => pod.id === props.sessionId,
			) ?? null,
	);
	const valid: ComputedRef<boolean> = computed(
		(): boolean =>
			props.sessionId === null || z.uuid().safeParse(props.sessionId).success,
	);
	const staleDelete: ComputedRef<boolean> = computed(
		(): boolean =>
			deleteSnapshot.value !== null &&
			JSON.stringify(deleteSnapshot.value) !==
				JSON.stringify(session.value?.fields),
	);
	/** Create or save through the store using the captured draft baseline. */
	async function save(
		fields: SessionFields,
		expected: SessionSnapshot | null,
	): Promise<ManagedSession> {
		if (props.sessionId === null) return store.create(fields);
		if (expected === null) throw new Error(t("sessions.notFound"));
		return store.save(props.sessionId, { fields, expected });
	}
	/** Navigate a newly created pod to its display-only detail screen. */
	async function saved(pod: ManagedSession): Promise<void> {
		editing.value = false;
		await navigateTo(`/mentor/sessions/${pod.id}`);
	}
	/** Cancel a new form or return the current pod to display mode. */
	async function cancel(): Promise<void> {
		if (props.sessionId === null) await navigateTo("/member/calendar");
		else editing.value = false;
	}
	/** Capture the exact record whose removal is being confirmed. */
	function confirmDelete(): void {
		if (session.value !== null)
			deleteSnapshot.value = { ...session.value.fields };
	}
	/** Archive the current pod only while its confirmed snapshot still matches. */
	async function remove(): Promise<void> {
		if (
			session.value === null ||
			deleteSnapshot.value === null ||
			staleDelete.value ||
			store.isSaving.value
		)
			return;
		try {
			await store.remove(session.value.id, { expected: deleteSnapshot.value });
			publish({
				name: "session.deleted",
				severity: "success",
				message: t("actionNotifications.deleted"),
			});
			await navigateTo("/member/calendar");
		} catch (error: unknown) {
			publish({
				name: "session.delete.error",
				severity: "error",
				message: requestFailureMessage(error) ?? t("sessions.saveError"),
			});
		}
	}
</script>
<template>
	<UDashboardPanel id="mentor-session-detail">
		<template #header
			><DashboardHeading
				:pageTitle="
					session?.topic ??
					t(sessionId === null ? 'calendar.addPod' : 'calendar.pods')
				"
				:breadcrumbLabel="t('nav.Calendar')"
				breadcrumbTo="/member/calendar"
		/></template>
		<template #body
			><div class="SessionEditor">
				<p v-if="store.isPending.value">{{ t("profile.loading") }}</p>
				<UAlert
					v-else-if="store.isError.value"
					color="error"
					:title="t('sessions.loadError')"
				/><UAlert
					v-else-if="!valid || (sessionId !== null && session === null)"
					color="error"
					:title="t('sessions.notFound')"
				/>
				<template v-else-if="store.data.value">
					<UPageCard v-if="editing"
						><SessionForm
							:session="session"
							:defaultHostId="store.data.value.actorId"
							:hosts="store.data.value.hosts"
							:saving="store.isSaving.value"
							:save="save"
							@saved="saved"
							@cancel="cancel"
					/></UPageCard>
					<SessionCard
						v-else-if="session"
						:session="session"
						:joining="store.isSaving.value"
						:join="store.join"
						><UCheckbox
							:modelValue="session.fields.mentorsOnly"
							disabled
							:label="t('sessions.mentorsOnly')"
						/><UButton class="EditorAction" @click="editing = true">{{
							t("calendar.editPod")
						}}</UButton></SessionCard
					>
					<UPageCard v-if="deleteSnapshot" :title="t('sessions.deleteConfirm')"
						><p>{{ t("sessions.deleteDescription") }}</p>
						<UAlert
							v-if="staleDelete"
							color="warning"
							:title="t('profile.remoteChanged')"
						/>
						<div class="EditorActions">
							<UButton
								color="error"
								:loading="store.isSaving.value"
								:disabled="staleDelete"
								@click="remove"
								>{{ t("calendar.deletePod") }}</UButton
							><UButton
								variant="outline"
								:disabled="store.isSaving.value"
								@click="deleteSnapshot = null"
								>{{ t("profile.cancel") }}</UButton
							>
						</div></UPageCard
					>
					<UButton
						v-else-if="session && !editing"
						class="EditorAction"
						color="error"
						variant="outline"
						:disabled="store.isSaving.value"
						@click="confirmDelete"
						>{{ t("calendar.deletePod") }}</UButton
					>
				</template>
			</div></template
		>
	</UDashboardPanel>
</template>
<style scoped lang="scss">
	.SessionEditor {
		display: grid;
		gap: calc(var(--spacing) * 5);
		padding: calc(var(--spacing) * 4);
		max-width: 60rem;
	}
	.EditorAction {
		justify-self: start;
		align-self: start;
		width: fit-content;
	}
	.EditorActions {
		display: flex;
		flex-wrap: wrap;
		gap: calc(var(--spacing) * 3);
	}
</style>
