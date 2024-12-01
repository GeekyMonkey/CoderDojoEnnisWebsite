<script setup lang="ts">
	import type { HTMLAttributes } from "vue";
	import { cn } from "@/lib/utils";
	import { useVModel } from "@vueuse/core";

	const props = defineProps<{
		defaultValue?: string | number;
		modelValue?: string | number;
		class?: HTMLAttributes["class"];
	}>();

	const emits = defineEmits<{
		(e: "update:modelValue", payload: string | number): void;
	}>();

	const modelValue = useVModel(props, "modelValue", emits, {
		passive: true,
		defaultValue: props.defaultValue,
	});
</script>

<template>
	<input
		v-model="modelValue"
		:class="
			'Input ' +
			cn(
				'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
				props.class,
			)
		"
	/>
</template>

<style lang="scss">
	input.Input {
		/* &::placeholder {
    color: var(--text-muted-foreground);
  } */
		border-radius: 8px;
		box-shadow: 2px 2px 3px 0px var(--shadow-color) inset;
		border-color: #222;
		border-bottom-color: #888;
		border-right-color: #888;

		&:focus-within {
			outline: none;
			border-color: var(--ring);
			box-shadow:
				0 0 5px 2px var(--hilight-color),
				2px 2px 3px 0px var(--shadow-color) inset;
		}

		&:disabled {
			cursor: not-allowed;
			opacity: 0.5;
		}
	}
</style>
