<script setup lang="ts">
	import type { VexSeasonModel } from "#shared/types/models/VexSeasonModel";

	defineProps<{
		season: VexSeasonModel;
		isMentor: boolean;
		heading?: string;
	}>();

	const emit = defineEmits<{
		edit: [];
		create: [];
	}>();

	const { t } = useI18n();
</script>

<template>
	<section class="VexSeasonBanner">
		<div class="VexSeasonText">
			<span class="VexSeasonEyebrow"
				>{{ heading ?? t("vex.home.currentSeason") }}</span
			>
			<span class="VexSeasonProgram">
				{{ season.programName }}
				{{ season.seasonLabel }}
			</span>
			<span class="VexSeasonGame">{{ season.competitionName }}</span>
			<p v-if="season.description" class="VexSeasonDescription">
				{{ season.description }}
			</p>
		</div>
		<div v-if="isMentor" class="VexSeasonActions">
			<UButton
				icon="i-lucide-pencil"
				size="sm"
				variant="soft"
				color="neutral"
				:label="t('vex.actions.editSeason')"
				@click="emit('edit')"
			/>
			<UButton
				icon="i-lucide-plus"
				size="sm"
				variant="ghost"
				color="neutral"
				:label="t('vex.actions.newSeason')"
				@click="emit('create')"
			/>
		</div>
	</section>
</template>

<style scoped lang="scss">
	.VexSeasonBanner {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: calc(var(--spacing) * 4);
		flex-wrap: wrap;
		padding: calc(var(--spacing) * 4) calc(var(--spacing) * 5);
		border-radius: var(--border-radius);
		border: solid 1px var(--ui-border);
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--ui-primary) 14%, transparent),
			transparent 70%
		);
	}

	.VexSeasonText {
		display: flex;
		flex-direction: column;
		gap: calc(var(--spacing) * 0.5);
	}

	.VexSeasonEyebrow {
		font-size: 0.8rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--ui-text-muted);
	}

	.VexSeasonProgram {
		font-weight: 600;
	}

	.VexSeasonGame {
		font-size: 1.75rem;
		font-weight: 800;
		color: var(--ui-primary);
		line-height: 1.1;
	}

	.VexSeasonDescription {
		margin-top: calc(var(--spacing) * 1);
		color: var(--ui-text-muted);
	}

	.VexSeasonActions {
		display: flex;
		gap: calc(var(--spacing) * 2);
		flex-wrap: wrap;
	}
</style>
