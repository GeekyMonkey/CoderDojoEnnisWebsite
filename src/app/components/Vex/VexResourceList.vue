<script setup lang="ts">
	import {
		VEX_RESOURCE_CATEGORIES,
		type VexResourceCategory,
		type VexResourceModel,
		type VexResourceType,
	} from "#shared/types/models/VexResourceModel";

	const props = defineProps<{
		resources: VexResourceModel[];
		isMentor: boolean;
		currentSeasonId: string | null;
	}>();

	const emit = defineEmits<{
		edit: [resource: VexResourceModel];
		add: [category: VexResourceCategory];
	}>();

	type CategoryGroup = {
		category: VexResourceCategory;
		resources: VexResourceModel[];
	};

	const TYPE_ICONS: Record<VexResourceType, string> = {
		document: "i-lucide-file-text",
		forum: "i-lucide-messages-square",
		tool: "i-lucide-code-xml",
		video: "i-lucide-circle-play",
		website: "i-lucide-globe",
	};

	const { t } = useI18n();

	/**
	 * Resources visible for the current season (general + this season), grouped by category.
	 * Empty categories are hidden from members but shown to mentors so they can add links.
	 */
	const groups = computed<CategoryGroup[]>(() =>
		VEX_RESOURCE_CATEGORIES.map((category) => ({
			category,
			resources: props.resources
				.filter(
					(r) =>
						r.category === category &&
						(!r.seasonId || r.seasonId === props.currentSeasonId),
				)
				.sort(
					(a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title),
				),
		})).filter((g) => props.isMentor || g.resources.length > 0),
	);
</script>

<template>
	<div class="VexResourceList">
		<section
			v-for="group in groups"
			:id="group.category"
			:key="group.category"
			class="VexResourceCategory"
		>
			<div class="VexResourceCategoryHeader">
				<div>
					<h3 class="VexResourceCategoryHeading">
						{{ t(`vex.resources.categories.${group.category}.label`) }}
					</h3>
					<p class="VexResourceCategoryIntro">
						{{ t(`vex.resources.categories.${group.category}.intro`) }}
					</p>
				</div>
				<UButton
					v-if="isMentor"
					icon="i-lucide-plus"
					size="xs"
					variant="ghost"
					color="neutral"
					:aria-label="t('vex.actions.addResource')"
					@click="emit('add', group.category)"
				/>
			</div>

			<p v-if="group.resources.length === 0" class="VexResourceEmpty">
				{{ t("vex.resources.empty") }}
			</p>
			<ul class="VexResourceItems">
				<li
					v-for="resource in group.resources"
					:key="resource.id"
					class="VexResourceItem"
					:data-inactive="!resource.isActive"
				>
					<a
						:href="resource.url"
						target="_blank"
						rel="noopener noreferrer"
						class="VexResourceLink"
					>
						<UIcon
							:name="TYPE_ICONS[resource.resourceType]"
							class="VexResourceIcon"
						/>
						<span class="VexResourceText">
							<span class="VexResourceTitle">
								{{ resource.title }}
								<UIcon name="i-lucide-external-link" class="VexExternal" />
							</span>
							<span v-if="resource.description" class="VexResourceDescription">
								{{ resource.description }}
							</span>
						</span>
					</a>
					<div v-if="isMentor" class="VexResourceAdmin">
						<UBadge
							v-if="!resource.isActive"
							color="neutral"
							variant="subtle"
							size="sm"
						>
							{{ t("vex.resources.hidden") }}
						</UBadge>
						<UButton
							icon="i-lucide-pencil"
							size="xs"
							variant="ghost"
							color="neutral"
							:aria-label="t('vex.actions.edit')"
							@click="emit('edit', resource)"
						/>
					</div>
				</li>
			</ul>
		</section>
	</div>
</template>

<style scoped lang="scss">
	.VexResourceList {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 22rem), 1fr));
		gap: calc(var(--spacing) * 4);
		align-items: start;
	}

	.VexResourceCategory {
		display: flex;
		flex-direction: column;
		gap: calc(var(--spacing) * 3);
		padding: calc(var(--spacing) * 4);
		border: solid 1px var(--ui-border);
		border-radius: var(--border-radius);
	}

	.VexResourceCategoryHeader {
		display: flex;
		justify-content: space-between;
		gap: calc(var(--spacing) * 2);
	}

	.VexResourceCategoryHeading {
		font-weight: 800;
	}

	.VexResourceCategoryIntro,
	.VexResourceEmpty {
		font-size: 0.9rem;
		color: var(--ui-text-muted);
	}

	.VexResourceItems {
		display: flex;
		flex-direction: column;
		gap: calc(var(--spacing) * 1);
	}

	.VexResourceItem {
		display: flex;
		align-items: flex-start;
		gap: calc(var(--spacing) * 2);

		&[data-inactive="true"] {
			opacity: 0.55;
		}
	}

	.VexResourceLink {
		flex: 1;
		display: flex;
		gap: calc(var(--spacing) * 3);
		padding: calc(var(--spacing) * 2);
		border-radius: calc(var(--border-radius) * 0.6);

		&:hover {
			background: var(--ui-bg-elevated);
		}
	}

	.VexResourceIcon {
		flex: none;
		width: 1.25rem;
		height: 1.25rem;
		margin-top: 0.15rem;
		color: var(--ui-primary);
	}

	.VexResourceText {
		display: flex;
		flex-direction: column;
		gap: calc(var(--spacing) * 0.5);
	}

	.VexResourceTitle {
		font-weight: 700;
		color: var(--ui-primary);
	}

	.VexExternal {
		width: 0.8rem;
		height: 0.8rem;
		vertical-align: middle;
	}

	.VexResourceDescription {
		font-size: 0.9rem;
	}

	.VexResourceAdmin {
		display: flex;
		align-items: center;
		gap: calc(var(--spacing) * 1);
		padding-top: calc(var(--spacing) * 2);
	}
</style>
