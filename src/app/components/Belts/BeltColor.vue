<script setup lang="ts">
	import type { BeltModel } from "#shared/types/models/BeltModel";

	type BeltColorKey =
		| "white"
		| "yellow"
		| "green"
		| "blue"
		| "red"
		| "black"
		| "noob"
		| "mentor"
		| "parent";

	type BeltColorSize = "sm" | "md" | "lg";

	const props = defineProps<{
		belt: BeltModel | BeltColorKey | string | null;
		size?: BeltColorSize;
		labelOverride?: string | null;
	}>();

	const { t } = useI18n();

	/**
	 * Check if a value is a BeltModel instance.
	 */
	const isBeltModel = (value: BeltModel | string | null): value is BeltModel => {
		return !!value && typeof value === "object" && "color" in value;
	};

	/**
	 * Normalize a belt color key string.
	 */
	const normalizeColorKey = (value: string | null): BeltColorKey => {
		const normalized = (value || "").toLowerCase();
		switch (normalized) {
			case "white":
			case "yellow":
			case "green":
			case "blue":
			case "red":
			case "black":
			case "noob":
			case "mentor":
			case "parent":
				return normalized as BeltColorKey;
			default:
				return "noob";
		}
	};

	/**
	 * Resolved color key for the belt.
	 */
	const beltColorKey = computed<BeltColorKey>(() => {
		if (isBeltModel(props.belt)) {
			return normalizeColorKey(props.belt.color);
		}
		if (typeof props.belt === "string") {
			return normalizeColorKey(props.belt);
		}
		return "noob";
	});

	/**
	 * Display label for the belt.
	 */
	const label = computed<string>(() => {
		if (props.labelOverride) {
			return props.labelOverride;
		}
		const colorKey = beltColorKey.value;
		switch (colorKey) {
			case "mentor":
				return t("mentors.label");
			case "parent":
				return t("parents.label");
			case "noob":
				return t("memberBelt.noob");
			default:
				return t("memberBelt.label", {
					Color: t(`memberBelt.color.${colorKey}`, colorKey),
				});
		}
	});

	/**
	 * Resolved belt color value for the background.
	 */
	const beltColor = computed<string>(() => {
		if (isBeltModel(props.belt)) {
			const hexCode = props.belt.hexCode;
			if (hexCode) {
				return hexCode;
			}
		}
		return `var(--belt_color-${beltColorKey.value})`;
	});

	/**
	 * Size class for the belt component.
	 */
	const sizeClass = computed<string>(() => `Size_${props.size || "md"}`);

	/**
	 * Color class for the belt component.
	 */
	const colorClass = computed<string>(() => `Color_${beltColorKey.value}`);
</script>

<template>
	<div
		class="BeltColor MemberBelt"
		:class="[sizeClass, colorClass]"
		:style="{ backgroundColor: beltColor }"
	>
		<label>{{ label }}</label>
	</div>
</template>

<style scoped lang="scss">
	.MemberBelt {
		--belt_color-mentor: purple;
		--belt_color-noob: var(--ui-bg);
		border: solid 1px black;

		color: black;
		font-weight: bold;
		text-align: center;

		&.Color_blue,
		.Color_red,
		.Color_black {
			color: white;
		}

		&.Color_mentor {
			color: white;
			background: linear-gradient(green, black) !important;
		}

		&.Color_noob {
			border: dashed 2px var(--ui-border);
			color: var(--ui-text);
		}

		&.Size_sm {
			height: 32px;
			width: 10px;
			label {
				display: none;
			}
		}
	}
</style>
