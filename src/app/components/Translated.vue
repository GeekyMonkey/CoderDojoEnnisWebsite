<template>
	<span class="T">{{ translatedText }}</span>
</template>

<script setup lang="ts">
	import { computed } from "vue";
	import { useTranslation } from "~/composables/UseTranslation";

	const { TranslateOrDefault } = useTranslation();

	const props = defineProps<{
		t: Translation | string | null;
	}>();

	const translatedText = computed<string>(() => {
		return TranslateOrDefault(props.t, "");
	});
</script>

<style lang="scss">
	.T {
	}
</style>
