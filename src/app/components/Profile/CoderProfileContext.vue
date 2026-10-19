<script setup lang="ts">
	import { useCoderContextStore } from "~/stores/useCoderContextStore";
	import TeamRoster from "~/components/Teams/TeamRoster.vue";
	const { t } = useI18n();
	const { data, isPending, isError } = useCoderContextStore();
</script>

<template>
	<div class="CoderProfileContext">
		<UButton to="/coder/passport" icon="i-lucide-printer" variant="outline">{{ t('printing.id') }}</UButton>
		<p v-if="isPending">{{ t('profile.loading') }}</p>
		<UAlert v-else-if="isError" color="error" :title="t('profile.loadError')" />
		<TeamRoster v-else-if="data" :team="data.team" :members="data.roster" profileBase="/coder/team-members" />
	</div>
</template>

<style scoped lang="scss">
	.CoderProfileContext { display: grid; gap: calc(var(--spacing) * 4); }
	.CoderProfileContext > :deep(a) { justify-self: start; }
</style>
