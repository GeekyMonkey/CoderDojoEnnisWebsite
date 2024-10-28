<template>
  <div>
    <button @click="setLang('en')">en</button>
  </div>
  <div>
    <button @click="setLang('fr')">fr</button>
  </div>
</template>

<script setup lang="ts">
const { locale, setLocale, setLocaleCookie, locales, availableLocales } =
  useI18n();

console.log("locale", locale.value);
console.log("locales", locales.value);
console.log("availableLocales", availableLocales);

const setLang = (lang: string) => {
  console.log("setLang", lang);
  setLocale(lang);
  setLocaleCookie(lang);
};
</script>

<style scoped lang="scss"></style>
