<script setup lang="ts">
	import type {
		VexResourceCategory,
		VexResourceModel,
	} from "#shared/types/models/VexResourceModel";
	import { useVexStore } from "~/stores/useVexStore";

	const { t } = useI18n();
	const { CurrentSeason, IsMentor, Resources, isResourcesLoading } =
		useVexStore();

	const isResourceModalOpen = ref<boolean>(false);
	const editingResource = ref<VexResourceModel | null>(null);
	const defaultCategory = ref<VexResourceCategory>("competition");

	/**
	 * Open the resource dialog for a new link in a category
	 */
	function addResource(category: VexResourceCategory): void {
		editingResource.value = null;
		defaultCategory.value = category;
		isResourceModalOpen.value = true;
	}

	/**
	 * Open the resource dialog for an existing link
	 */
	function editResource(resource: VexResourceModel): void {
		editingResource.value = resource;
		isResourceModalOpen.value = true;
	}
</script>

<template>
	<UDashboardPanel id="vex-resources">
		<template #header>
			<DashboardHeading :page-title="t('vex.resources.title')">
				<template #right>
					<VexSectionNav />
				</template>
			</DashboardHeading>
		</template>
		<template #body>
			<div class="VexPage">
				<div class="VexResourcesIntro">
					<p>{{ t("vex.resources.intro") }}</p>
					<UButton
						v-if="IsMentor"
						icon="i-lucide-plus"
						:label="t('vex.actions.addResource')"
						@click="addResource('competition')"
					/>
				</div>

				<section class="VexVrPanel">
					<div class="VexVrHeading">
						<UIcon name="i-lucide-monitor-play" class="VexVrIcon" />
						<h2>{{ t("vex.resources.vr.heading") }}</h2>
					</div>
					<p>{{ t("vex.resources.vr.p1") }}</p>
					<p>{{ t("vex.resources.vr.p2") }}</p>
					<p class="VexVrController">
						<UIcon name="i-lucide-gamepad-2" />
						<span>{{ t("vex.resources.vr.p3") }}</span>
					</p>
					<p>{{ t("vex.resources.vr.p4") }}</p>
				</section>

				<p v-if="isResourcesLoading" class="VexMuted">
					{{ t("vex.common.loading") }}
				</p>
				<VexResourceList
					v-else
					:resources="Resources"
					:is-mentor="IsMentor"
					:current-season-id="CurrentSeason?.id ?? null"
					@add="addResource"
					@edit="editResource"
				/>

				<VexResourceEditModal
					v-if="IsMentor"
					v-model:open="isResourceModalOpen"
					:resource="editingResource"
					:default-category="defaultCategory"
				/>
			</div>
		</template>
	</UDashboardPanel>
</template>

<style scoped lang="scss">
	.VexPage {
		display: flex;
		flex-direction: column;
		gap: calc(var(--spacing) * 6);
		padding: calc(var(--spacing) * 4);
		max-width: 1200px;
	}

	.VexResourcesIntro {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: calc(var(--spacing) * 4);
		flex-wrap: wrap;

		p {
			max-width: 50rem;
			font-size: 1.05rem;
		}
	}

	.VexVrPanel {
		display: flex;
		flex-direction: column;
		gap: calc(var(--spacing) * 2);
		padding: calc(var(--spacing) * 5);
		border-radius: var(--border-radius);
		border: solid 2px var(--ui-primary);
		background: color-mix(in srgb, var(--ui-primary) 6%, var(--ui-bg));
		max-width: 60rem;
	}

	.VexVrHeading {
		display: flex;
		align-items: center;
		gap: calc(var(--spacing) * 2);

		h2 {
			font-size: 1.2rem;
			font-weight: 800;
		}
	}

	.VexVrIcon {
		width: 1.75rem;
		height: 1.75rem;
		color: var(--ui-primary);
	}

	.VexVrController {
		display: flex;
		gap: calc(var(--spacing) * 2);
		padding: calc(var(--spacing) * 3);
		border-radius: calc(var(--border-radius) * 0.6);
		background: var(--ui-bg-elevated);

		:deep(svg),
		> span:first-child {
			flex: none;
		}
	}

	.VexMuted {
		color: var(--ui-text-muted);
	}
</style>
