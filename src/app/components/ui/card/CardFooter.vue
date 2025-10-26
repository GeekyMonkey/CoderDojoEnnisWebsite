<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps<{
	class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <div :class="'CartFooter ' + cn('flex items-center p-6 pt-0', props.class)">
    <slot />
  </div>
</template>

<style lang="scss">
.CardFooter {
  border-top: solid 1px var(--card-border-color);
  text-align: center;
}
</style>
