<script setup lang="ts">
	import type { BeltModel } from "#shared/types/models/BeltModel";
	import type { MemberModel } from "#shared/types/models/MemberModel";
	import BeltColor from "~/components/Belts/BeltColor.vue";
	import { useBeltsStore } from "~/stores/useBeltsStore";
	import { useMemberBeltsStore } from "~/stores/useMemberBeltsStore";

	const props = defineProps<{
		member: MemberModel;
		size?: "sm" | "md" | "lg";
	}>();

	const { MembersLatestBeltsByMemberId } = useMemberBeltsStore();
	const { BeltsById } = useBeltsStore();

	/**
	 * Resolve the belt model for the member.
	 */
	const belt = computed<BeltModel | null>(() => {
		if (!MembersLatestBeltsByMemberId.value || !BeltsById.value) {
			return null;
		}

		const memberBelt = MembersLatestBeltsByMemberId.value[props.member.id];
		if (!memberBelt) {
			return null;
		}

		return BeltsById.value[memberBelt.beltId] || null;
	});

	/**
	 * Resolve the belt display value for the BeltColor component.
	 */
	const beltDisplayValue = computed<BeltModel | string | null>(() => {
		if (props.member.isMentor) {
			return "mentor";
		}
		if (props.member.isParent) {
			return "parent";
		}
		if (!belt.value) {
			return "noob";
		}
		return belt.value;
	});
</script>

<template>
	<BeltColor :belt="beltDisplayValue" :size="props.size" />
</template>
