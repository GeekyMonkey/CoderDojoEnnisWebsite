<script setup lang="ts">
	import { onMounted } from "vue";
	import { useBadgeCategoriesStore } from "~/composables/BadgeCategoriesStore";
	import { useBadgesStore } from "~/composables/BadgesStore";
	import { useBeltsStore } from "~/composables/BeltsStore";
	import { useTeamsStore } from "~/composables/TeamsStore";

	const { Teams, Options, isLoading, error } = useTeamsStore();
	const { BadgeCategories, BadgesByCategory } = useBadgesStore();
	const { Belts } = useBeltsStore();

	onMounted(() => {
		console.log("TeamsList Component Mounted");
	});
</script>

<template>
	<h1>TEAMS</h1>
	<div class="TeamsList">
		<p
			v-for="team in Teams"
			:style="`color:${team.hexcode};`"
			:title="team.goal"
		>
			{{ team.teamName }}
		</p>
	</div>
	<hr />

	<h1>Belts</h1>
	<div class="TeamsList">
		<p
			v-for="belt in Belts"
			:style="`border: solid 2px ${belt.hexCode}; margin: 3px 0;`"
			:title="belt.description"
		>
			{{ belt.color }}
		</p>
	</div>
	<hr />

	<h1>Badge Categories</h1>
	<div class="TeamsList">
		<div v-for="badgeCategory in BadgeCategories">
			<div style="margin-top: 5px">{{ badgeCategory.categoryName }}</div>
			<ul>
				<li
					v-for="badge in BadgesByCategory[badgeCategory.id]"
					:title="badge.description"
					style="margin-left: 20px"
				>
					{{ badge.achievement }}
				</li>
			</ul>
		</div>
	</div>
	<hr />
</template>

<style lang="scss">
	h1 {
		margin: 10px 0 5px;
		font-size: 1.5rem;
	}
	.TeamsList {
	}
</style>
