<script setup lang="ts">
	const { TranslateOrDefault } = useTranslation();

	const props = defineProps<{
		t: Translation | string | null;
	}>();

	const translatedText = computed<string>(() => {
		return TranslateOrDefault(props.t, "");
	});
</script>

<template><span class="T">{{ translatedText }}</span></template>

<style lang="css">
	.T {
	}
</style>
