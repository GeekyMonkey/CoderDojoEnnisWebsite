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
  border-radius: var(--border-radius);
  border: solid 1px var(--card-border-color);
  background-color: var(--background-color);
  box-shadow: 4px 4px 8px var(--shadow-color);
  color: var(--foreground-color);

  &.Active,
  &:has(:focus) {
    box-shadow: 0 0 13px var(--hilight-color);
  }

  .CardHeadder {
    border-radius: var(--border-radius);
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
}

.dark-mode {
  .Card {
    .CardHeadder {
      background: linear-gradient(
        0deg,
        rgba(0, 0, 0, 0) 0%,
        rgba(0, 50, 100, 0.5) 100%
      );
    }
  }
}

.light-mode {
  .Card {
    .CardHeadder {
      background: linear-gradient(
        0deg,
        rgba(255, 255, 255, 0) 0%,
        rgba(200, 200, 255, 0.7) 100%
      );
    }
  }
}
</style>
