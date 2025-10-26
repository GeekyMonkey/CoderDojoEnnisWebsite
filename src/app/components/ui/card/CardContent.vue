<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps<{
	class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <div :class="cn('p-4', props.class)">
    <slot />
  </div>
</template>

<style lang="css">
form {
  border: none !important;
  background-color: transparent !important;
}
</style>
