<script setup lang="ts">
	import { onMounted } from "vue";
	import { useTeamsStore } from "~/composables/TeamsStore";
	import type { TeamModel } from "~~/shared/types";

	const { Teams, isLoading, error } = useTeamsStore();

	onMounted(() => {
		console.log("TeamsList Component Mounted");
	});
</script>

<template>
	<div class="TeamsList">
		<p v-for="team in Teams" :style="`color:${team.hexcode};`">
			{{ team.teamName }}
		</p>
	</div>
</template>

<style lang="scss">
	.TeamsList {
	}
</style>
