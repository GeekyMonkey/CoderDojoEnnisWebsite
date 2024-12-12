<script setup lang="ts">
	import DialogCloseButton from "./ui/dialog/DialogClose.vue";
	import { VisuallyHidden } from "radix-vue";

	const { locale, setLocale, setLocaleCookie, locales } = useI18n();

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
	};

	const setHtmlLangAttribute = (lang: string) => {
		document.documentElement.setAttribute("lang", lang);
	};

	onMounted(() => {
		setHtmlLangAttribute(locale.value);
	});
</script>

<template>
	<Dialog>
		<!-- Button to open the dialog -->
		<DialogTrigger as-child>
			<Button
				class="LanguageButton"
				variant="outline"
				:title="`${currentLanguage} ?`"
			>
				<NuxtIcon name="Language" class="LanguageIcon w-5 h-5" />
				<span class="sr-only">Language</span>
			</Button>
		</DialogTrigger>

		<!-- Dialog -->
		<DialogContent class="LanguageDialog">
			<DialogHeader>
				<VisuallyHidden>
					<DialogTitle>Choose Language</DialogTitle>
				</VisuallyHidden>
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
