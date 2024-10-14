<template>
  <ColorScheme placeholder="…" tag="span">
    <div>
      <DarkToggle />
      <slot />
    </div>
  </ColorScheme>
</template>

<script setup lang="ts">
import DarkToggle from "~/components/DarkToggle.vue";
</script>

<style scoped lang="scss"></style>
