<script setup lang="ts">
	import type { HTMLAttributes } from "vue";
	import { cn } from "@/lib/utils";

	const props = defineProps<{
		class?: HTMLAttributes["class"];
	}>();
</script>

<template>
	<div
		:class="'CardHeader ' + cn('flex flex-col gap-y-1.5 p-4', props.class)"
	>
		<slot />
	</div>
</template>

<style lang="css">
	.CardHeader {
		border-bottom: solid 1px var(--card-border-color);
		text-align: center;
	}
</style>
