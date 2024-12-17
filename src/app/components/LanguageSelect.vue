<script setup lang="ts">
	const { locale, setLocale, setLocaleCookie, locales } = useI18n();
	const dialogRef = ref();

	const currentLanguage = computed<string>(() => {
		return (
			locales.value.find((l) => l.code === locale.value)?.language ?? ""
		);
	});

	const setLang = (lang: string) => {
		console.log("setLang", lang);
		setLocale(lang);
		setLocaleCookie(lang);
		setHtmlLangAttribute(lang);
		dialogRef.value.close();
	};

	const setHtmlLangAttribute = (lang: string) => {
		document.documentElement.setAttribute("lang", lang);
	};

	onMounted(() => {
		setHtmlLangAttribute(locale.value);
	});
</script>

<template>
	<UiDialog
		ref="dialogRef"
		class="LanguageDialog"
		icon="Language"
		title="Language"
	>
		<!-- Button to open the dialog -->
		<template #trigger>
			<UiButton :title="`${currentLanguage} ?`" :icon="`Language`">
			</UiButton>
		</template>

		<!-- Dialog Content-->
		<template #content>
			<div class="menu">
				<ul class="menu-list LanguageButtons">
					<li>
						<a
							class="button"
							:class="{ 'is-active': locale === lang.code }"
							v-for="lang in locales"
							:key="lang.code"
							@click="setLang(lang.code)"
						>
							{{ lang.language }}
						</a>
					</li>
				</ul>
			</div>
		</template>
	</UiDialog>
</template>

<style lang="scss">
	.LanguageDialog {
		max-width: 400px;
	}
</style>
