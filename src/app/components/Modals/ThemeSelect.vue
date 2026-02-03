<script setup lang="ts">
	const { CurrentTheme, SetTheme, ThemesConfig } = useUiConfig();
	const { Translate, TranslateOrDefault } = useTranslation();
	const log = useLogger("ThemeSelect");
	const isOpen = ref(false);

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
	 * Get the list of themes, sorted by name
	 */
	const themes = computed<ThemeModel[]>(() => {
		const sorted: ThemeModel[] = [...(ThemesConfig.value?.themes ?? [])].sort(
			(a, b) => {
				const aName: string = TranslateOrDefault(a.themeName, "").toLowerCase();
				const bName: string = TranslateOrDefault(b.themeName, "").toLowerCase();
				return aName.localeCompare(bName, undefined, {
					sensitivity: "base",
				});
			},
		);
		log.info("themes", { themes: sorted });
		return sorted;
	});
</script>

<template>
	<UModal
		v-if="themes.length > 1"
		class="ThemeDialog"
		v-model:open="isOpen"
		:title="Translate('theme.select') || undefined"
		:description="Translate('theme.description') || undefined"
	>
		<template #default>
			<slot name="trigger">
				<UButton
					v-if="props.showTriggerButton"
					class="ThemeButton"
					variant="outline"
					:title="Translate('theme.select')"
					:aria-label="Translate('theme.select') || undefined"
				>
					<Icon
						v-if="CurrentTheme?.darkOrLight === 'dark'"
						name="line-md:sunny-filled-loop-to-moon-filled-alt-loop-transition"
						class="LanguageIcon w-5 h-5"
					/>

					<Icon
						v-else
						name="line-md:moon-filled-to-sunny-filled-loop-transition"
						class="LanguageIcon w-5 h-5"
					/>
					<span class="sr-only">{{ Translate("theme.select") }}</span>
				</UButton>
			</slot>
		</template>
		<template #body>
			<ButtonsStack>
				<UButton
					class="ThemeButton w-full justify-between"
					v-for="theme in themes"
					:data-selected="CurrentTheme?.id == theme.id"
					:key="theme.id"
					:title="Translate('theme.author', { AuthorName: theme.author })"
					:variant="CurrentTheme?.id === theme.id ? 'solid' : 'outline'"
					@click="
						SetTheme(theme.id);
						isOpen = false;
					"
				>
					<Translated :t="theme.themeName" />
					<Icon
						:name="
							theme.darkOrLight === 'dark'
								? 'line-md:sunny-filled-loop-to-moon-filled-alt-loop-transition'
								: 'line-md:moon-filled-to-sunny-filled-loop-transition'
						"
					/>
				</UButton>
			</ButtonsStack>
		</template>
	</UModal>
</template>

<style scoped>
	.ThemeDialog {
		max-width: 400px;
	}
</style>
