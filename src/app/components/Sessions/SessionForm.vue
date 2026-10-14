<script setup lang="ts">
	import { useSectionDraft } from "~/composables/useSectionDraft";
	import { useActionNotifications } from "~/composables/useActionNotifications";
	import { requestFailureMessage } from "#shared/utils/RequestFailure";
	import {
		sessionFormSchema,
		editableSessionFields,
		type ManagedSession,
		type SessionFields as PodFields,
		type SessionSnapshot,
	} from "#shared/types/SessionMaintenance";
	import type { SessionHost } from "#shared/types/CoderSession";
	import SessionFields from "./SessionFields.vue";
	const props = defineProps<{
		session: ManagedSession | null;
		defaultHostId: string;
		hosts: SessionHost[];
		saving: boolean;
		save: (
			fields: PodFields,
			expected: SessionSnapshot | null,
		) => Promise<ManagedSession>;
	}>();
	const emit = defineEmits<{ saved: [session: ManagedSession]; cancel: [] }>();
	type DraftSession = { id: string; fields: SessionSnapshot };
	const { t } = useI18n();
	const { publish } = useActionNotifications();
	const NEW_SESSION: DraftSession = {
		id: "new",
		fields: {
			topic: null,
			url: null,
			hostId: props.defaultHostId,
			host2Id: null,
			mentorsOnly: false,
			sessionDate: new Date().toISOString().slice(0, 10),
			endsAt: null,
		},
	};
	const { fields, baseline, dirty, remoteChanged, reset } = useSectionDraft(
		(): DraftSession => props.session ?? NEW_SESSION,
		(session: DraftSession): SessionSnapshot => session.fields,
	);
	/** Save only validated fields while preserving the full original conflict-detection snapshot. */
	async function submit(): Promise<void> {
		if (props.saving || remoteChanged.value) return;
		try {
			emit(
				"saved",
				await props.save(
					editableSessionFields(sessionFormSchema.parse(fields)),
					props.session ? baseline.value : null,
				),
			);
			publish({
				name: "session.saved",
				severity: "success",
				message: t("actionNotifications.saved"),
			});
		} catch (error: unknown) {
			publish({
				name: "session.save.error",
				severity: "error",
				message: requestFailureMessage(error) ?? t("sessions.saveError"),
			});
		}
	}
</script>
<template>
	<UForm
		:schema="sessionFormSchema"
		:state="fields"
		class="SessionForm"
		@submit="submit"
	>
		<SessionFields :fields="fields" :hosts="hosts" :disabled="saving" />
		<p>{{ t("sessions.renewal") }}</p>
		<UAlert
			v-if="remoteChanged"
			color="warning"
			:title="t('profile.remoteChanged')"
		/>
		<UButton
			v-if="remoteChanged"
			variant="outline"
			class="FormAction"
			@click="reset"
			>{{ t("profile.reload") }}</UButton
		>
		<div class="FormActions">
			<UButton
				type="submit"
				:loading="saving"
				:disabled="remoteChanged || (!!session && !dirty)"
				>{{ t("calendar.savePod") }}</UButton
			><UButton variant="outline" :disabled="saving" @click="emit('cancel')">{{
				t("profile.cancel")
			}}</UButton>
		</div>
	</UForm>
</template>
<style scoped lang="scss">
	.SessionForm {
		display: grid;
		gap: calc(var(--spacing) * 4);
	}
	.FormActions {
		display: flex;
		flex-wrap: wrap;
		gap: calc(var(--spacing) * 3);
	}
	.FormAction {
		justify-self: start;
	}
</style>
