<template>
	<Dialog>
		<DialogTrigger as-child>
			<Button class="DarkToggleButton" variant="outline">
				<NuxtIcon name="Language" class="LanguageIcon w-5 h-5" />
				<span class="sr-only">Language</span>
			</Button>
		</DialogTrigger>
		<DialogContent class="LanguageDialog">
			<DialogHeader>
				<NuxtIcon name="Language" class="LanguageIcon w-8 h-8" />
				<DialogCloseButton />
			</DialogHeader>

			<!-- Any button will close the dialog-->
			<DialogClose>
				<div class="LanguageButtons">
					<Button
						class="LanguageButton w-full"
						v-for="lang in locales"
						:key="lang.code"
						@click="setLang(lang.code)"
						>{{ lang.language }}</Button
					>
				</div>
			</DialogClose>
		</DialogContent>
	</Dialog>
</template>

<script setup lang="ts">
	import { onMounted } from "vue";
	import DialogHeader from "./ui/dialog/DialogHeader.vue";

	const { locale, setLocale, setLocaleCookie, locales, availableLocales } =
		useI18n();

	const setLang = (lang: string) => {
		console.log("setLang", lang);
		setLocale(lang);
		setLocaleCookie(lang);
		setHtmlLangAttribute(lang);
	};

	const setHtmlLangAttribute = (lang: string) => {
		document.documentElement.setAttribute("lang", lang);
	};

	onMounted(() => {
		setHtmlLangAttribute(locale.value);
	});
</script>

<style lang="scss">
	.LanguageDialog {
		max-width: 200px;
		.LanguageButtons {
			display: flex;
			flex-direction: column;
			gap: 1rem;
		}
	}
</style>
