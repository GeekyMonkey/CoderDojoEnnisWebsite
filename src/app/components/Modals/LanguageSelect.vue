<script setup lang="ts">
	import { ref } from "vue";

	const isOpen = ref(false);
	const { locale, setLocale, setLocaleCookie, locales } = useI18n();
	const log = useLogger("LanguageSelect");

	const currentLanguage = computed<string>(() => {
		return locales.value.find((l) => l.code === locale.value)?.language ?? "";
	});

	const setLang = (lang: string) => {
		log.info("setLang", { lang });

		setLocale(lang);
		setLocaleCookie(lang);
		setHtmlLangAttribute(lang);
		isOpen.value = false;
	};

	const setHtmlLangAttribute = (lang: string) => {
		document.documentElement.setAttribute("lang", lang);
	};

	onMounted(() => {
		setHtmlLangAttribute(locale.value);
	});
</script>

<template>
	<UModal v-model="isOpen" class="LanguageDialog" v-model:open="isOpen">
		<UButton
			class="LanguageButton"
			variant="outline"
			:title="`${currentLanguage} ?`"
		>
			<Icon name="Language" class="LanguageIcon w-5 h-5"/>
			<span class="sr-only">Language</span>
		</UButton>

		<template #header>
			<Icon name="Language" class="LanguageIcon w-8 h-8"/>
		</template>
		<template #body>
			<div class="LanguageButtons">
				<UButton
					class="LanguageButton w-full"
					v-for="lang in locales"
					:key="lang.code"
					@click="setLang(lang.code)"
				>
					{{ lang.language }}
				</UButton>
			</div>
		</template>
	</UModal>
</template>

<style lang="css">
	.LanguageDialog {
		max-width: 200px;
		.LanguageButtons {
			display: flex;
			flex-direction: column;
			gap: 1rem;
		}
	}
</style>
