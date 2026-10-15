<script setup lang="ts">
	import type { AchievementReview } from "#shared/types/AchievementReview";
	import { useShowcaseStore } from "~/stores/useShowcaseStore";
	import { useCoderActionsStore } from "~/stores/useCoderActionsStore";
	import { useActionNotifications } from "~/composables/useActionNotifications";
	import { requestFailureMessage } from "#shared/utils/RequestFailure";
	import ApplicationShowcaseLinks from "./ApplicationShowcaseLinks.vue";
	const props = defineProps<{ review: AchievementReview }>();
	const { t } = useI18n();
	const showcase: ReturnType<typeof useShowcaseStore> = useShowcaseStore(
		() => null,
		true,
	);
	const actions: ReturnType<typeof useCoderActionsStore> =
		useCoderActionsStore();
	const { publish } = useActionNotifications();
	/** Save only while this exact application still has the displayed links. */
	async function change(ids: string[]): Promise<void> {
		try {
			await actions.updateApplicationShowcase({
				kind: props.review.kind,
				id: props.review.id,
				showcaseItemIds: ids,
				expectedShowcaseItemIds: props.review.showcaseItemIds ?? [],
			});
		} catch (error: unknown) {
			publish({
				name: "applicationShowcase.error",
				severity: "error",
				message: requestFailureMessage(error) ?? t("profile.saveError"),
			});
		}
	}
</script>
<template>
	<ApplicationShowcaseLinks
		:items="showcase.items.value"
		:selectedIds="review.showcaseItemIds ?? []"
		:disabled="actions.isSaving.value"
		:loading="showcase.isPending.value"
		:error="showcase.isError.value"
		@change="change"
	/>
</template>
