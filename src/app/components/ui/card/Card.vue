<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <div
    :class="
      `Card ` +
      cn('rounded-xl border bg-card text-card-foreground', props.class)
    "
  >
    <slot />
  </div>
</template>

<style lang="css">
.Card {
  border-radius: 10px;
  box-shadow: 4px 4px 8px black;
  border: solid 1px var(--card-border-color);
  background-color: var(--background-color);

  &.Active,
  &:has(:focus) {
    box-shadow: 0 0 13px var(--hilight-color);
  }
}
</style>
