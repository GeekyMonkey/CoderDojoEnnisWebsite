<script setup lang="ts">
	const { t } = useI18n();
</script>
<template>
	<div class="PresenceLegend">
		<span><i class="Present" aria-hidden="true" />{{ t('attendance.columns.present') }}</span>
		<span><i class="Registered" aria-hidden="true" />{{ t('attendance.include.registeredMembers') }}</span>
		<span><i class="Other" aria-hidden="true" />{{ t('attendance.include.otherMembers') }}</span>
	</div>
</template>
<style scoped lang="scss">
	.PresenceLegend { display: flex; flex-wrap: wrap; gap: calc(var(--spacing) * 4); font-size: var(--text-xs); color: var(--ui-text-muted); }
	span { display: flex; align-items: center; gap: var(--spacing); }
	i { width: .6rem; height: .6rem; border-radius: 50%; }
	.Present { background-color: var(--color-green-500); }
	.Registered { background-color: var(--color-orange-500); }
	.Other { background-color: var(--color-red-500); }
</style>
