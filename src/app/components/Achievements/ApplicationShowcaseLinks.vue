<script setup lang="ts">
	import { computed, ref, type ComputedRef, type Ref } from "vue";
	import type { ShowcaseItem } from "#shared/types/Showcase";
	import ShowcaseCard from "~/components/Showcase/ShowcaseCard.vue";
	const props = defineProps<{
		items: ShowcaseItem[];
		selectedIds: string[];
		disabled?: boolean;
		loading?: boolean;
		error?: boolean;
	}>();
	const emit = defineEmits<{ change: [ids: string[]] }>();
	const { t } = useI18n();
	const choosing: Ref<boolean> = ref(false);
	const selected: ComputedRef<ShowcaseItem[]> = computed((): ShowcaseItem[] =>
		props.selectedIds.flatMap((id: string): ShowcaseItem[] =>
			props.items.filter((item: ShowcaseItem): boolean => item.id === id),
		),
	);
	const available: ComputedRef<ShowcaseItem[]> = computed((): ShowcaseItem[] =>
		props.items.filter(
			(item: ShowcaseItem): boolean => !props.selectedIds.includes(item.id),
		),
	);
	/** Add once, retaining the coder's chosen order. */
	function add(id: string): void {
		emit("change", [...props.selectedIds, id]);
		choosing.value = false;
	}
	/** Unlink a project without deleting the showcase entry. */
	function remove(id: string): void {
		emit(
			"change",
			props.selectedIds.filter((value: string): boolean => value !== id),
		);
	}
</script>
<template>
	<section class="ApplicationShowcase">
		<h4>{{ t("applicationShowcase.title") }}</h4>
		<div class="EvidenceProjects">
			<ShowcaseCard v-for="item in selected" :key="item.id" :item="item"
				><template #actions
					><UButton
						type="button"
						:disabled="disabled"
						color="error"
						variant="outline"
						@click="remove(item.id)"
						>{{ t("applicationShowcase.delete") }}</UButton
					></template
				></ShowcaseCard
			>
		</div>
		<UButton
			type="button"
			:disabled="disabled || loading || error"
			@click="choosing = !choosing"
			>{{
				t(choosing ? "achievementReviews.cancel" : "applicationShowcase.add")
			}}</UButton
		>
		<p v-if="loading">{{ t("profile.loading") }}</p>
		<p v-if="error" role="alert">{{ t("applicationShowcase.loadError") }}</p>
		<section v-if="choosing">
			<p v-if="!available.length">{{ t("applicationShowcase.empty") }}</p>
			<div class="EvidenceProjects">
				<ShowcaseCard v-for="item in available" :key="item.id" :item="item"
					><template #actions
						><UButton
							type="button"
							:disabled="disabled"
							@click="add(item.id)"
							>{{ t("applicationShowcase.add") }}</UButton
						></template
					></ShowcaseCard
				>
			</div>
		</section>
	</section>
</template>
<style scoped lang="scss">
	.ApplicationShowcase {
		display: grid;
		gap: 1rem;
		width: 100%;
		justify-items: start;
	}
	.EvidenceProjects {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 16rem), 20rem));
		gap: 1rem;
		width: 100%;
	}
	h4 {
		font-weight: 600;
	}
</style>
