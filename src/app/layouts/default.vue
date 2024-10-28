<template>
  <!-- <ColorScheme placeholder="…" tag="span"> -->
  <div>
    <DarkToggle />

    <div>
      <button @click="setLocale('en')">en</button>
      <button @click="setLocale('fr')">fr</button>
      <p>{{ $t("welcome") }}</p>
    </div>

    <slot />
  </div>
  <!-- </ColorScheme> -->
</template>

<script setup lang="ts">
const { locale, setLocale } = useI18n();
</script>

<style scoped lang="scss"></style>
