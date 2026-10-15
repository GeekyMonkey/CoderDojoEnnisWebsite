<script setup lang="ts">
	import {
		computed,
		ref,
		watch,
		nextTick,
		type Ref,
		type ComputedRef,
	} from "vue";
	import {
		PROJECT_ICONS,
		PROJECT_LABELS,
		type ShowcaseItem,
	} from "#shared/types/Showcase";
	const props = defineProps<{ item: ShowcaseItem }>();
	const expanded: Ref<boolean> = ref(false);
	const updated: Ref<boolean> = ref(false);
	const failed: Ref<number> = ref(0);
	const image: ComputedRef<string | null> = computed((): string | null =>
		failed.value === 0
			? (props.item.avatarUrl ?? props.item.photoUrl)
			: failed.value === 1 && props.item.avatarUrl
				? props.item.photoUrl
				: null,
	);
	/** Try legacy image format, then the member photo before showing initials. */
	function imageError(event: Event): void {
		const element: HTMLImageElement = event.target as HTMLImageElement;
		if (element.src.includes(".png"))
			element.src = element.src.replace(".png", ".jpg");
		else failed.value++;
	}
	watch(
		(): string =>
			`${props.item.avatarUrl}:${props.item.photoUrl}:${props.item.updatedAt}`,
		(): void => {
			failed.value = 0;
		},
	);
	/** Highlight changed card content while retaining disclosure state. */
	watch(
		(): string => JSON.stringify(props.item),
		async (): Promise<void> => {
			updated.value = false;
			await nextTick();
			updated.value = true;
		},
	);
</script>
<template>
	<article
		class="showcase-card"
		:class="{
			'showcase-card-expanded': expanded,
			'showcase-card-updated': updated,
		}"
	>
		<span class="showcase-burst" aria-hidden="true"
			><i v-for="particle in 12" :key="particle" class="showcase-particle"
		/></span>
		<button
			class="showcase-disclosure"
			type="button"
			:aria-expanded="expanded"
			:aria-controls="`showcase-details-${item.id}`"
			@click="expanded = !expanded"
		>
			<span class="showcase-card-meta"
				><UIcon
					:name="PROJECT_ICONS[item.projectType]"
					:aria-label="PROJECT_LABELS[item.projectType]"
					role="img"
				/><span>{{ PROJECT_LABELS[item.projectType] }}</span
				><time :datetime="item.showcaseDate">{{
					item.showcaseDate
				}}</time></span
			>
			<img
				v-if="item.thumbnailUrl"
				class="showcase-thumbnail"
				:src="item.thumbnailUrl"
				alt=""
				loading="lazy"
				:key="item.thumbnailUrl"
			/>
			<span v-else class="showcase-thumbnail showcase-placeholder"
				><UIcon :name="PROJECT_ICONS[item.projectType]"
			/></span>
			<span class="showcase-member"
				><img v-if="image" :src="image" alt="" @error="imageError" /><span
					v-else
					class="showcase-initial"
					>{{ item.memberName.slice(0, 1) }}</span
				><span
					>{{ item.memberName }}<small>@{{ item.username }}</small></span
				></span
			>
			<span class="showcase-card-heading"
				>{{ item.title
				}}<UIcon
					:name="expanded ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
			/></span>
		</button>
		<div
			v-show="expanded"
			:id="`showcase-details-${item.id}`"
			class="showcase-details"
		>
			<p>{{ item.description }}</p>
			<a :href="item.url" target="_blank" rel="noopener noreferrer"
				>Open project <span aria-hidden="true">↗</span></a
			>
		</div>
	</article>
</template>
