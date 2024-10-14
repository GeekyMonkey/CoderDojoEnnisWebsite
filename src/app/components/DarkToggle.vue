<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/vue";

const colorMode = useColorMode();

/**
 * Toggle the color mode
 */
const toggleColorMode = () => {
  colorMode.preference = colorMode.preference === "dark" ? "light" : "dark";
};
</script>

<template>
  <Button class="DarkToggleButton" variant="outline" @click="toggleColorMode">
    <Icon
      icon="radix-icons:moon"
      class="ToggleIcon rotate-0 scale-100 dark:-rotate-180 dark:scale-0"
    />
    <Icon
      icon="radix-icons:sun"
      class="ToggleIcon rotate-180 scale-0 dark:rotate-0 dark:scale-100"
    />
    <span class="sr-only">Toggle theme</span>
  </Button>
</template>

<style scoped lang="scss">
.DarkToggleButton {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
  position: relative;

  .ToggleIcon {
    @apply h-[1.2rem] w-[1.2rem] transition-all duration-1000;
    grid-column: 1 / 2;
    grid-row: 1 / 2;
  }
}
</style>
