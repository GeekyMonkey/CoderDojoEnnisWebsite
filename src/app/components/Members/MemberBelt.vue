<script setup lang="ts">
	import type { MemberModel } from "~~/shared/types/models/MemberModel";
	import { useMemberBeltsStore } from '~/stores/useMemberBeltsStore';
	import { useBeltsStore } from '~/stores/useBeltsStore';

	const props = defineProps<{
		member: MemberModel;
		size?: "sm" | "md" | "lg";
	}>();

	export type BeltColors = 'white' | 'yellow' | 'green' | 'blue' | 'red' | 'black' | 'noob' | 'mentor' | 'parent';

	const { t } = useI18n();
	const { MembersLatestBeltsByMemberId } = useMemberBeltsStore();
	const { BeltsById } = useBeltsStore();

	/**
	 * Belt Type
	 */
	const belt = computed<BeltModel | null>(() => {
		if (!MembersLatestBeltsByMemberId.value || !BeltsById.value) {
			return null;
		}

		const memberBelt = MembersLatestBeltsByMemberId.value[props.member.id];
		if (!memberBelt) {
			return null
		}

		return BeltsById.value[memberBelt.beltId] || null;
	});

	/**
	 * Belt Label
	 */
	const label = computed(() => {
		const colorKey = beltColorKey.value;
		switch (colorKey) {
			case 'mentor':
				return t('memberBelt.mentor');
			case 'parent':
				return t('memberBelt.parent');
			case 'noob':
				return t('memberBelt.noob');
			default:
				return t('memberBelt.label', { Color: t(`memberBelt.color.${colorKey}`, colorKey) });
		}
	});

	/**
	 * Belt Color Key
	 */
	const beltColorKey = computed<BeltColors>(() => {
		if (props.member.isMentor) {
			return 'mentor';
		}
		if (props.member.isParent) {
			return 'parent';
		}
		if (!belt?.value) {
			return 'noob';
		}

		const b = belt.value;
		const c = (b?.color || "").toLowerCase();
		switch (c) {
			case 'white':
			case 'yellow':
			case 'green':
			case 'blue':
			case 'red':
			case 'black':
				return c as BeltColors;
			default:
				return 'noob';
		}
	});

	const beltColor = computed<string>(() => {
		const hexCode = belt.value?.hexCode;
		if (!hexCode) {
			return `var(--belt_color-${beltColorKey.value})`;
		}
		return hexCode;
	});

</script>

<template>
	<div class="MemberBelt"
		:class="`Size_${[props.size || 'md']} Color_${beltColorKey}`"
		:style="{backgroundColor:beltColor}">
		{{ label }}
	</div>
</template>

<style lang="scss">

	.MemberBelt {
		--belt_color-mentor: purple;
		--belt_color-noob: var(--ui-bg);
		border: solid 1px black;

		color: black;
		font-weight: bold;
		text-align: center;

		&.Color_blue,.Color_red,.Color_black {
			color: white;
		}

		&.Color_mentor {
			color: white;
			background: linear-gradient(green,black) !important;
		}

		&.Color_noob {
			border: dashed 2px var(--ui-border);
			color: var(--ui-text);
		}
	}
</style>
