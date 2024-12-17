<script setup lang="ts">
	import { Icon } from "@iconify/vue";

	const { CurrentTheme, SetTheme, ThemesConfig } = useUiConfig();
	const { Translate, TranslateOrDefault } = useTranslation();
	const dialogRef = ref();

	const themes = computed<ThemeModel[]>(() => {
		const sorted: ThemeModel[] = [
			...(ThemesConfig.value?.themes ?? []),
		].sort((a, b) => {
			const aName = TranslateOrDefault(a.themeName, "").toLowerCase();
			const bName = TranslateOrDefault(b.themeName, "").toLowerCase();
			const compare = aName.localeCompare(bName, undefined, {
				sensitivity: "base",
			});
			return compare;
		});
		return sorted;
	});

	const SelectTheme = (themeId: string) => {
		SetTheme(themeId);
		dialogRef.value.close();
	};

	const icon = computed<string>(() => {
		return CurrentTheme.value?.darkOrLight === "dark"
			? "line-md:sunny-filled-loop-to-moon-filled-alt-loop-transition"
			: "line-md:moon-filled-to-sunny-filled-loop-transition";
	});

	onMounted(() => {});
</script>

<template>
	<UiDialog
		v-if="themes.length > 1"
		ref="dialogRef"
		class="ThemeDialog"
		:icon="icon"
		:title="Translate('theme.select')"
	>
		<!-- Button to open the dialog -->
		<template #trigger>
			<UiButton
				:title="Translate('theme.select')"
				:icon="icon"
			></UiButton>
		</template>

		<!-- Dialog Content -->
		<template #content>
			<div class="menu">
				<ul class="menu-list">
					<li>
						<a
							class="button ThemeButton"
							v-for="theme in themes"
							:class="{
								'is-active': CurrentTheme?.id == theme.id,
							}"
							:key="theme.folder"
							:title="
								Translate('theme.author', {
									AuthorName: theme.author,
								})
							"
							@click="SelectTheme(theme.id)"
						>
							<Translated :t="theme.themeName" />
							<Icon
								:icon="
									theme.darkOrLight === 'dark'
										? 'line-md:sunny-filled-loop-to-moon-filled-alt-loop-transition'
										: 'line-md:moon-filled-to-sunny-filled-loop-transition'
								"
							/>
						</a>
					</li>
				</ul>
			</div>
		</template>
	</UiDialog>
</template>

<style lang="scss">
	.ThemeDialog {
		max-width: 400px;

		.ThemeButton {
			display: flex;
			justify-content: space-between;
			align-items: center;
		}
	}
</style>
