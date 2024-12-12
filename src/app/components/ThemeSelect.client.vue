<script setup lang="ts">
	import DialogCloseButton from "./ui/dialog/DialogClose.vue";
	import { Icon } from "@iconify/vue";

	const { CurrentTheme, SetTheme, ThemesConfig } = useUiConfig();
	const { Translate, TranslateOrDefault } = useTranslation();

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
		console.log("[ThemeSelect] themes", sorted);
		return sorted;
	});

	onMounted(() => {});
</script>

<template>
	<Dialog v-if="themes.length > 1">
		<!-- Button to open the dialog -->
		<DialogTrigger as-child>
			<Button
				class="ThemeButton"
				variant="outline"
				:title="Translate('theme.select')"
			>
				<Icon
					v-if="CurrentTheme?.darkOrLight === 'dark'"
					icon="line-md:sunny-filled-loop-to-moon-filled-alt-loop-transition"
					class="ToggleIcon w-5 h-5"
				/>
				<Icon
					v-else
					icon="line-md:moon-filled-to-sunny-filled-loop-transition"
					class="ToggleIcon w-5 h-5"
				/>
				<span class="sr-only">Theme</span>
			</Button>
		</DialogTrigger>

		<!-- Dialog -->
		<DialogContent class="ThemeDialog">
			<DialogHeader>
				<DialogTitle>
					<NuxtIcon name="Theme" class="ThemeIcon w-8 h-8" />
					<Translated t="theme.select" />
				</DialogTitle>
				<DialogCloseButton />
			</DialogHeader>

			<!-- Any button will close the dialog-->
			<DialogClose>
				<div class="ThemeButtons">
					<Button
						class="ThemeButton w-full justify-between"
						v-for="theme in themes"
						:data-selected="CurrentTheme?.id == theme.id"
						:key="theme.folder"
						:title="
							Translate('theme.author', {
								AuthorName: theme.author,
							})
						"
						@click="SetTheme(theme.id)"
					>
						<Translated :t="theme.themeName" />
						<Icon
							:icon="
								theme.darkOrLight === 'dark'
									? 'line-md:sunny-filled-loop-to-moon-filled-alt-loop-transition'
									: 'line-md:moon-filled-to-sunny-filled-loop-transition'
							"
							class="ToggleIcon w-5 h-5"
						/>
					</Button>
				</div>
			</DialogClose>
		</DialogContent>
	</Dialog>
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
