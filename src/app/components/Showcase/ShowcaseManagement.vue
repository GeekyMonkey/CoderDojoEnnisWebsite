<script setup lang="ts">
	import { ref, watch, type Ref } from "vue";
	import { useShowcaseStore } from "~/stores/useShowcaseStore";
	import { PROJECT_LABELS, type ShowcaseItem } from "#shared/types/Showcase";
	import ShowcaseEditor from "./ShowcaseEditor.vue";
	const props = defineProps<{ memberId?: string }>();
	const store: ReturnType<typeof useShowcaseStore> = useShowcaseStore(
		(): string | null => props.memberId ?? null,
		true,
	);
	const editing: Ref<ShowcaseItem | null> = ref(null);
	const open: Ref<boolean> = ref(false);
	const error: Ref<string> = ref("");
	/** Open a fresh shared editor for an existing or new entry. */
	function edit(item: ShowcaseItem | null): void {
		editing.value = item;
		open.value = true;
		error.value = "";
	}
	/** Remove an entry after explicit confirmation. */
	async function remove(item: ShowcaseItem): Promise<void> {
		if (!window.confirm(`Delete “${item.title}”?`)) return;
		try {
			await store.remove.mutateAsync(item);
		} catch {
			error.value = "Unable to delete entry. Reload and retry.";
		}
	}
	watch(
		(): string | undefined => props.memberId,
		(): void => {
			open.value = false;
			editing.value = null;
			error.value = "";
		},
	);
</script>
<template>
	<UDashboardPanel id="showcase"><template #body>
	<section class="ShowcaseManagement">
		<header>
			<h1>Showcase</h1>
			<p>Choose the projects you want to share with our community.</p>
			<UButton v-if="!open" icon="i-lucide-plus" @click="edit(null)"
				>Add showcase entry</UButton
			><a href="/showcase" target="_blank" rel="noopener"
				>View public showcase ↗</a
			>
		</header>
		<p v-if="store.isPending.value" role="status">Loading your showcase…</p>
		<div v-else-if="store.isError.value" role="alert">
			Unable to load showcase.
			<button type="button" @click="store.refetch()">Try again</button>
		</div>
		<template v-else-if="store.context.value"
			><ShowcaseEditor
				v-if="open"
				:key="editing?.id ?? 'new'"
				:context="store.context.value"
				:item="editing"
				:store="store"
				@saved="open = false"
				@cancel="open = false"
			/><template v-else
				><p v-if="!store.items.value.length">
					No showcase entries yet. Add something you made.
				</p>
				<article
					v-for="item in store.items.value"
					:key="item.id"
					class="ManagedEntry"
				>
					<img v-if="item.thumbnailUrl" :src="item.thumbnailUrl" alt="" />
					<div>
						<h2>{{ item.title }}</h2>
						<p>
							{{ PROJECT_LABELS[item.projectType] }} · {{ item.showcaseDate }} ·
							{{ item.isVisible ? "Visible" : "Hidden" }}
						</p>
					</div>
					<UButton variant="outline" @click="edit(item)">Edit</UButton
					><UButton
						color="error"
						variant="ghost"
						:disabled="store.remove.isPending.value"
						@click="remove(item)"
						>Delete</UButton
					>
				</article></template
			></template
		>
		<p v-if="error" role="alert">{{ error }}</p>
	</section>
	</template></UDashboardPanel>
</template>
<style scoped lang="scss">
	.ShowcaseManagement {
		display: grid;
		align-content: start;
		align-self: start;
		gap: 1.5rem;
		padding: 1.5rem;
		max-width: 65rem;
		width: 100%;
		margin-inline: auto;
	}
	header {
		display: grid;
		gap: 1rem;
	}
	h1 {
		font-size: 2rem;
		font-weight: 700;
	}
	.ManagedEntry {
		display: flex;
		gap: 1rem;
		align-items: center;
		border: 1px solid var(--ui-border);
		padding: 1rem;
		border-radius: 0.7rem;
		flex-wrap: wrap;
	}
	.ManagedEntry img {
		width: 5rem;
		height: 5rem;
		object-fit: contain;
	}
	.ManagedEntry div {
		flex: 1;
		min-width: 10rem;
	}
</style>
