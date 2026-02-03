<script setup lang="ts">
	import { useMemberAttendanceStore } from "~/stores/useMemberAttendanceStore";

	// Destructure refs directly from the store (eliminates intermediate `store` object usage)
	const {
		CurrentSessionDate,
		CurrentSessionMemberIds,
		SessionCount,
		AttendanceTotal,
		isLoading,
		isError,
	} = useMemberAttendanceStore();

	// Computed proxies for template consumption
	const sessionDate = computed(() => CurrentSessionDate.value || "—");
	const memberIds = computed(() => CurrentSessionMemberIds.value);
	const memberCount = computed(() => memberIds.value.length);
	const hasMembers = computed(
		() => !isLoading.value && !isError.value && memberCount.value > 0,
	);
</script>

<template>
	<div class="session-stats">
		<div class="row">
			<strong>Date:</strong>
			<span>{{ sessionDate }}</span>
		</div>
		<div class="row">
			<strong>Signed In:</strong>
			<span>{{ memberCount }}</span>
		</div>
		<div class="row">
			<strong>Total Sessions:</strong>
			<span>{{ SessionCount }}</span>
		</div>
		<div class="row">
			<strong>Total Attendance:</strong>
			<span>{{ AttendanceTotal }}</span>
		</div>
		<div v-if="isLoading" class="status">Loading…</div>
		<div v-else-if="isError" class="status error">
			Error loading attendance.
		</div>
		<ul v-else-if="hasMembers" class="list">
			<li v-for="id in memberIds" :key="id">{{ id }}</li>
		</ul>
		<div v-else class="status empty">No members signed in yet.</div>
		<div class="actions">
			<UButton size="xs" variant="outline" @click="refetchCurrent">
				Refresh
			</UButton>
		</div>
	</div>
</template>

<style scoped>
	.session-stats {
		border: 1px solid #ccc;
		padding: 8px;
		border-radius: 6px;
		font-size: 0.8rem;
		background: rgba(255, 255, 255, 0.5);
	}
	.row {
		line-height: 1.1rem;
	}
	.list {
		list-style: none;
		padding: 0;
		margin: 6px 0 0;
		max-height: 160px;
		overflow: auto;
		font-family: monospace;
		font-size: 0.7rem;
	}
	.list li {
		line-height: 1.1rem;
	}
	.status {
		margin-top: 4px;
		font-size: 0.75rem;
	}
	.status.error {
		color: #b30000;
	}
	.status.empty {
		font-style: italic;
		color: #555;
	}
</style>
