<script setup lang="ts">
	import { useMembersStore } from "~/stores/useMembersStore";

	definePageMeta({
		layout: "member-layout",
	});

	const route = useRoute();
	const { Members, isLoading, isError } = useMembersStore();

	const memberId = computed(() => {
		const raw = route.params.member_id;
		return typeof raw === "string" ? raw : "";
	});

	const member = computed(() => {
		return Members.value.find((m) => m.id === memberId.value) ?? null;
	});

	const title = computed(() => {
		const m = member.value;
		if (!m) {
			return "Coder";
		}
		const first = m.nameFirst ?? "";
		const last = m.nameLast ?? "";
		return [first, last].filter(Boolean).join(" ") || m.login || "Coder";
	});
</script>

<template>
	<UDashboardPanel id="mentor-coder-details">
		<template #header>
			<DashboardHeading :page-title="title" />
		</template>

		<template #body>
			<div class="p-4 space-y-3">
				<div v-if="isLoading" class="text-sm opacity-70">Loading…</div>
				<div v-else-if="isError" class="text-sm opacity-70">
					Could not load member.
				</div>
				<div v-else-if="!member" class="text-sm opacity-70">
					Member not found.
				</div>
				<UPageCard v-else>
					<p class="text-sm opacity-70">Coder details coming soon.</p>
					<div class="mt-2 text-sm">
						<div><span class="font-semibold">ID:</span> {{ member.id }}</div>
						<div>
							<span class="font-semibold">Login:</span>
							{{ member.login || "-" }}
						</div>
					</div>
				</UPageCard>
			</div>
		</template>
	</UDashboardPanel>
</template>
