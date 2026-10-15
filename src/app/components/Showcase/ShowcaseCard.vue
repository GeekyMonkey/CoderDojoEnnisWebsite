<script setup lang="ts">
	import {
		useId,
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
	const disclosureId: string = useId();
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
			:aria-controls="disclosureId"
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
		<div v-show="expanded" :id="disclosureId" class="showcase-details">
			<p>{{ item.description }}</p>
			<a :href="item.url" target="_blank" rel="noopener noreferrer"
				>Open project <span aria-hidden="true">↗</span></a
			>
		</div>
		<div v-if="$slots.actions" class="showcase-card-actions">
			<slot name="actions" />
		</div>
	</article>
</template>

<style scoped lang="scss">
	.showcase-card {
		min-width: 0;
		overflow: hidden;
		border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
		border-radius: 1rem;
		background: var(--public-color-surface, var(--ui-bg, Canvas));
	}
	.showcase-card.showcase-leave-active {
		background: transparent;
		border-color: transparent;
		overflow: visible;
	}
	:where(.showcase-burst) {
		display: none;
	}
	.showcase-disclosure {
		width: 100%;
		display: grid;
		gap: 1rem;
		padding: 1rem;
		border: 0;
		text-align: left;
		background: none;
		color: inherit;
		font: inherit;
		cursor: pointer;
	}
	.showcase-disclosure:focus-visible {
		outline: 3px solid Highlight;
		outline-offset: -4px;
	}
	.showcase-card-meta {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.5rem;
		font-size: 0.75rem;
	}
	.showcase-card-meta time {
		margin-inline-start: auto;
		opacity: 0.7;
	}
	.showcase-thumbnail {
		display: block;
		width: 100%;
		aspect-ratio: 4/3;
		object-fit: contain;
		background: color-mix(in srgb, CanvasText 6%, Canvas);
		border-radius: 0.5rem;
	}
	.showcase-placeholder {
		display: grid;
		place-items: center;
		font-size: 4rem;
	}
	.showcase-member {
		display: flex;
		align-items: center;
		gap: 0.7rem;
		font-size: 0.85rem;
	}
	.showcase-member img,
	.showcase-initial {
		width: 2.5rem;
		height: 2.5rem;
		object-fit: cover;
		border-radius: 50%;
		flex: 0 0 auto;
	}
	.showcase-initial {
		display: grid;
		place-items: center;
		background: color-mix(in srgb, Highlight 20%, Canvas);
	}
	.showcase-member small {
		display: block;
		opacity: 0.65;
	}
	.showcase-card-heading {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		font-size: 1.25rem;
		font-weight: 750;
		overflow-wrap: anywhere;
	}
	.showcase-details {
		padding: 0 1rem 1.3rem;
	}
	.showcase-details p {
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		margin-block-end: 1rem;
	}

	.showcase-card-actions {
		padding: 0 1rem 1rem;
		display: flex;
		gap: 0.5rem;
	}
</style>
