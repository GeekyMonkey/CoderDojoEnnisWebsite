<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";
import { Primitive, type PrimitiveProps } from "radix-vue";
import { type ButtonVariants, buttonVariants } from ".";

interface Props extends PrimitiveProps {
	variant?: ButtonVariants["variant"];
	size?: ButtonVariants["size"];
	class?: HTMLAttributes["class"];
}

const props = withDefaults(defineProps<Props>(), {
	as: "button",
});
</script>

<template>
	<Primitive
		:as="as"
		:as-child="asChild"
		:class="'Button ' + cn(buttonVariants({ variant, size }), props.class)"
	>
		<slot />
	</Primitive>
</template>

<style lang="scss">
	.Button {
		border: solid 1px var(--card-border-color);

		&:focus {
			box-shadow: 0 0 13px var(--hilight-color);
			border-color: var(--hilight-color);
		}

		&.button_icon {
			border: none;

			&:focus {
				box-shadow: none;
			}
		}

		&[data-selected="true"] {
			outline: solid 2px var(--hilight-color);
		}
	}

	.InputWithButton {
		display: flex;
		align-items: center;
		width: 100%;

		Input {
			flex: 1;
		}

		Button {
			margin-left: -50px;
		}
	}
</style>
