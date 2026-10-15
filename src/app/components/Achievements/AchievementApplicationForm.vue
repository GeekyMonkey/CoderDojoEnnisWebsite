<script setup lang="ts">
	import { useShowcaseStore } from "~/stores/useShowcaseStore";
	import ApplicationShowcaseLinks from "./ApplicationShowcaseLinks.vue";
	import { computed, reactive, watch, type ComputedRef } from "vue";
	import type { ShowcaseItem } from "#shared/types/Showcase";
	import { applicationEvidenceSchema } from "#shared/types/Coder";
	import { useActionNotifications } from "~/composables/useActionNotifications";
	import { requestFailureMessage } from "#shared/utils/RequestFailure";
	const props = defineProps<{
		saving: boolean;
		apply: (notes: string, showcaseItemIds: string[]) => Promise<unknown>;
	}>();
	const { t } = useI18n();
	const { publish } = useActionNotifications();
	const showcase: ReturnType<typeof useShowcaseStore> = useShowcaseStore(
		() => null,
		true,
	);
	const fields: { notes: string; showcaseItemIds: string[] } = reactive({
		notes: "",
		showcaseItemIds: [],
	});
	const valid: ComputedRef<boolean> = computed(
		(): boolean => applicationEvidenceSchema.safeParse(fields).success,
	);
	/** Validate evidence before submitting through the supplied store action. */
	async function submit(): Promise<void> {
		if (props.saving) return;
		try {
			const body: ReturnType<typeof applicationEvidenceSchema.parse> =
				applicationEvidenceSchema.parse(fields);
			await props.apply(body.notes, body.showcaseItemIds);
			fields.notes = "";
			fields.showcaseItemIds = [];
			publish({
				name: "coder.application.saved",
				severity: "success",
				message: t("coder.applicationSaved"),
			});
		} catch (error: unknown) {
			publish({
				name: "coder.application.error",
				severity: "error",
				message: requestFailureMessage(error) ?? t("profile.saveError"),
			});
		}
	}
	/** Retain unsaved valid selections when realtime refresh removes a deleted project. */
	watch(showcase.items, (items: ShowcaseItem[]): void => {
		if (showcase.isPending.value || showcase.isError.value) return;
		const ids: Set<string> = new Set(
			items.map((item: ShowcaseItem): string => item.id),
		);
		fields.showcaseItemIds = fields.showcaseItemIds.filter(
			(id: string): boolean => ids.has(id),
		);
	});
</script>
<template>
	<UForm
		:schema="applicationEvidenceSchema"
		:state="fields"
		class="ApplicationForm"
		@submit="submit"
		><UFormField
			class="ApplicationField"
			name="notes"
			:label="t('coder.evidence')"
			required
			><UTextarea
				v-model="fields.notes"
				:disabled="saving"
				:maxlength="4000"
				class="EvidenceInput" /></UFormField
		><ApplicationShowcaseLinks
			:items="showcase.items.value"
			:selectedIds="fields.showcaseItemIds"
			:disabled="saving"
			:loading="showcase.isPending.value"
			:error="showcase.isError.value"
			@change="fields.showcaseItemIds = $event"
		/><UButton type="submit" :loading="saving" :disabled="!valid || saving">{{
			t("coder.apply")
		}}</UButton></UForm
	>
</template>
<style scoped lang="scss">
	.ApplicationForm {
		display: grid;
		gap: calc(var(--spacing) * 3);
		justify-items: start;
	}
	.ApplicationField,
	.EvidenceInput {
		width: 100%;
	}
	.ApplicationForm :deep([data-slot="root"]) {
		max-width: 100%;
	}
</style>
