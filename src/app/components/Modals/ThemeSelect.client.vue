<script setup lang="ts">
	const { CurrentTheme, SetTheme, ThemesConfig } = useUiConfig();
	const { Translate, TranslateOrDefault } = useTranslation();
	const log = useLogger("ThemeSelect");
	const isOpen = ref(false);

	const themes = computed<ThemeModel[]>(() => {
		const sorted: ThemeModel[] = [...(ThemesConfig.value?.themes ?? [])].sort(
			(a, b) => {
				const aName = TranslateOrDefault(a.themeName, "").toLowerCase();
				const bName = TranslateOrDefault(b.themeName, "").toLowerCase();
				const compare = aName.localeCompare(bName, undefined, {
					sensitivity: "base",
				});
				return compare;
			},
		);
		log.info("themes", { themes: sorted });
		return sorted;
	});
</script>

<template>
	<UModal v-if="themes.length > 1" class="ThemeDialog" v-model:open="isOpen">
		<UButton
			class="ThemeButton"
			variant="outline"
			:title="Translate('theme.select')"
		>
			<NuxtIcon
				v-if="CurrentTheme?.darkOrLight === 'dark'"
				name="line-md:sunny-filled-loop-to-moon-filled-alt-loop-transition"
				class="LanguageIcon w-5 h-5"
			/>

			<NuxtIcon
				v-else
				name="line-md:moon-filled-to-sunny-filled-loop-transition"
				class="LanguageIcon w-5 h-5"
			/>
			<span class="sr-only">Theme</span>
		</UButton>

		<template #header>
			<NuxtIcon name="Theme" class="ThemeIcon w-8 h-8"/>
			<Translated t="theme.select"/>
		</template>

		<template #body>
			<div class="ThemeButtons">
				<UButton
					class="ThemeButton w-full justify-between"
					v-for="theme in themes"
					:data-selected="CurrentTheme?.id == theme.id"
					:key="theme.id"
					:title="Translate('theme.author', { AuthorName: theme.author })"
					@click="SetTheme(theme.id); isOpen = false"
				>
					<Translated :t="theme.themeName"/>
					<NuxtIcon
						:name="theme.darkOrLight === 'dark' ? 'line-md:sunny-filled-loop-to-moon-filled-alt-loop-transition' : 'line-md:moon-filled-to-sunny-filled-loop-transition'"
					/>
				</UButton>
			</div>
		</template>
	</UModal>
</template>

<style lang="scss">
.ThemeDialog {
  max-width: 400px;
  .ThemeButtons {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
