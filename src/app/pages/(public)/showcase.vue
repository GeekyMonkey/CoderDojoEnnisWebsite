<script setup lang="ts">
	import { computed, reactive, watch, type ComputedRef } from "vue";
	import { useShowcaseStore } from "~/stores/useShowcaseStore";
	import ShowcaseCard from "~/components/Showcase/ShowcaseCard.vue";
	import {
		PROJECT_LABELS,
		PROJECT_TYPES,
		filterShowcase,
		type ShowcaseItem,
		type ShowcaseFilters,
	} from "#shared/types/Showcase";
	definePageMeta({ layout: "public-layout", siteSection: "public" });
	useHead({
		title: "Showcase | CoderDojo Ennis",
		meta: [
			{
				name: "description",
				content:
					"Explore projects shared by CoderDojo Ennis coders, parents and mentors.",
			},
		],
	});
	const store: ReturnType<typeof useShowcaseStore> = useShowcaseStore();
	const filters: ShowcaseFilters = reactive({
		memberType: "coder",
		projectType: "",
		username: "",
		sort: "newest",
	});
	const hasParents: ComputedRef<boolean> = computed((): boolean =>
		store.items.value.some((item: ShowcaseItem): boolean =>
			item.roles.includes("parent"),
		),
	);
	const results: ComputedRef<ShowcaseItem[]> = computed((): ShowcaseItem[] =>
		filterShowcase(store.items.value, filters),
	);
	watch(hasParents, (available: boolean): void => {
		if (!available && filters.memberType === "parent")
			filters.memberType = "coder";
	});
	/** Keep disappearing cards out of the keyboard and accessibility tree during their burst. */
	function beginLeave(element: Element): void {
		element.setAttribute("inert", "");
		element.setAttribute("aria-hidden", "true");
	}
	/** Restore a card if a rapid filter change cancels its disappearance. */
	function cancelLeave(element: Element): void {
		element.removeAttribute("inert");
		element.removeAttribute("aria-hidden");
	}
</script>
<template>
	<div class="public-showcase">
		<header class="page-intro">
			<p class="showcase-eyebrow">Made at our dojo</p>
			<h1>Showcase</h1>
			<p class="lead">
				Games, experiments and ideas. Made by our community, shared by their
				creators.
			</p>
		</header>
		<section class="showcase-filters" aria-label="Filter showcase">
			<label
				>Member type<select
					v-model="filters.memberType"
					aria-label="Member type"
				>
					<option value="coder">Coder</option>
					<option v-if="hasParents" value="parent">Parent</option>
					<option value="mentor">Mentor</option>
				</select></label
			><label
				>Project type<select
					v-model="filters.projectType"
					aria-label="Project type"
				>
					<option value="">All projects</option>
					<option
						v-for="projectType in PROJECT_TYPES"
						:key="projectType"
						:value="projectType"
					>
						{{ PROJECT_LABELS[projectType] }}
					</option>
				</select></label
			><label
				>Username<input
					aria-label="Username"
					v-model="filters.username"
					type="search"
					placeholder="Find a creator" /></label
			><label
				>Sort<select v-model="filters.sort" aria-label="Sort">
					<option value="newest">Newest first</option>
					<option value="oldest">Oldest first</option>
				</select></label
			>
		</section>
		<p v-if="store.isPending.value" class="notice" role="status">
			Loading showcase…
		</p>
		<div v-else-if="store.isError.value" class="notice" role="alert">
			<p>Showcase couldn’t be loaded.</p>
			<button
				class="button button-outline"
				type="button"
				@click="store.refetch()"
			>
				Try again
			</button>
		</div>
		<template v-else
			><p class="showcase-count" role="status" aria-live="polite">
				{{ results.length }}
				{{ results.length === 1 ? "project" : "projects" }}
			</p>
			<p v-if="!results.length" class="notice">
				{{
					store.items.value.length
						? "No projects match these filters."
						: "The first projects will appear here soon."
				}}
			</p>
			<TransitionGroup
				appear
				name="showcase"
				@beforeLeave="beginLeave"
				@leaveCancelled="cancelLeave"
				tag="section"
				class="showcase-grid"
				aria-label="Shared projects"
				><ShowcaseCard
					v-for="item in results"
					:key="item.id"
					:item="item" /></TransitionGroup
		></template>
		<aside class="callout">
			<section>
				<h2>Share something you made</h2>
				<p>Sign in and open Showcase to add your project.</p>
			</section>
			<a class="button" href="/login">Member sign-in ↗</a>
		</aside>
	</div>
</template>
