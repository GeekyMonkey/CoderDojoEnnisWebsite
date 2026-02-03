<script setup lang="ts">
	import { ref } from "vue";

	type LocaleCode = Parameters<typeof setLocale>[0];

	const isOpen = ref(false);
	const { locale, setLocale, setLocaleCookie, locales, t } = useI18n();
	const log = useLogger("LanguageSelect");

	const props = withDefaults(
		defineProps<{
			showTriggerButton?: boolean;
		}>(),
		{
			showTriggerButton: true,
		},
	);

	defineExpose({
		isOpen,
	});

	/**
	 * Compute the available locales
	 */
	const availableLocales = computed(
		() => locales.value as Array<{ code: LocaleCode; language: string }>,
	);

	/**
	 * Compute the current language name
	 */
	const currentLanguage = computed<string>(() => {
		return locales.value.find((l) => l.code === locale.value)?.language ?? "";
	});

	/**
	 * Set the language
	 */
	const setLang = (lang: LocaleCode) => {
		log.info("setLang", { lang });

		setLocale(lang);
		setLocaleCookie(lang);
		isOpen.value = false;
	};

	/**
	 * Set the HTML lang attribute
	 */
	useHead(() => ({
		htmlAttrs: {
			lang: locale.value,
		},
	}));
</script>

<template>
	<UModal
		v-model:open="isOpen"
		class="LanguageDialog"
		:title="t('language.select')"
		:description="t('language.description')"
	>
		<template #default>
			<slot name="trigger">
				<UButton
					v-if="props.showTriggerButton"
					class="LanguageButton"
					variant="outline"
					:title="t('language.current', { Language: currentLanguage })"
					:aria-label="t('language.select')"
				>
					<Icon name="Language" class="LanguageIcon w-5 h-5" />
					<span class="sr-only">{{ t("language.select") }}</span>
				</UButton>
			</slot>
		</template>
		<template #body>
			<ButtonsStack>
				<UButton
					class="LanguageButton w-full"
					v-for="lang in availableLocales"
					:key="lang.code"
					:variant="lang.code === locale ? 'solid' : 'outline'"
					@click="setLang(lang.code)"
				>
					{{ lang.language }}
				</UButton>
			</ButtonsStack>
		</template>
	</UModal>
</template>

<style scoped>
	.LanguageDialog {
		max-width: 200px;
	}
</style>
