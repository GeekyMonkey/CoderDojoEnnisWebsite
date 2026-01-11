<script setup lang="ts">
	import type { DropdownMenuItem, NavigationMenuItem } from "@nuxt/ui";
	import type { SupabaseUserMetaType } from "~~/shared/types/Supabase";
	import type { MemberSupabaseModel } from "~~/shared/types/models/MemberModel";
	import {
		buildNavigationModel,
		filterNavByRoles,
		getMemberRoles,
		getRoleFlagsFromUserMeta,
		toNavigationMenuItems,
		type MemberRole,
	} from "~/utils/memberNavigation";

	const route = useRoute();
	const router = useRouter();
	const user = useSupabaseUser();
	const { TranslateOrDefault } = useTranslation();
	const { CurrentTheme, SetTheme, ThemesConfig } = useUiConfig();
	const { locale, setLocale, setLocaleCookie, locales, t, te } = useI18n();

	const isThemeMenuOpen = ref(false);
	const isLanguageMenuOpen = ref(false);

	const section = computed<string | null>(() => {
		const seg = route.path.split("/")[1];
		return seg ? seg : null;
	});

	const roles = computed<MemberRole[]>(() => {
		const meta = (user.value?.user_metadata ?? null) as SupabaseUserMetaType | null;
		const flags = getRoleFlagsFromUserMeta(meta);
		return getMemberRoles(flags);
	});

	const navGroups = computed(() => {
		const groups = buildNavigationModel("");
		return filterNavByRoles(groups, roles.value);
	});

	const navItems = computed<NavigationMenuItem[][]>(() => {
		const translateLabel = (label: string) => {
			const key = `nav.${label}`;
			return te(key) ? t(key) : label;
		};
		return toNavigationMenuItems(navGroups.value, translateLabel);
	});

	const primaryNavItems = computed<NavigationMenuItem[][]>(() => {
		return navItems.value.slice(0, 1);
	});

	const secondaryNavItems = computed<NavigationMenuItem[][]>(() => {
		return navItems.value.slice(1);
	});

	const titleByPath = computed(() => {
		const map = new Map<string, string>();
		for (const group of navItems.value) {
			for (const item of group) {
				if (typeof item.to === "string") {
					map.set(item.to, item.label ?? "");
				}
			}
		}
		return map;
	});

	const pageTitle = computed(() => {
		return titleByPath.value.get(route.path) || "";
	});

	const displayName = computed(() => {
		const meta = (user.value?.user_metadata ?? null) as MemberSupabaseModel | null;
		const first = meta?.nameFirst;
		const last = meta?.nameLast;
		const full = [first, last].filter(Boolean).join(" ");
		return full || user.value?.email || "User";
	});

	function openProfile() {
		const base = section.value ? `/${section.value}` : "";
		router.push(`${base}/profile`);
	}

	type LocaleCode = Parameters<typeof setLocale>[0];
	const availableLocales = computed(
		() => locales.value as Array<{ code: LocaleCode; language: string }>,
	);

	function setLang(lang: LocaleCode) {
		setLocale(lang);
		setLocaleCookie(lang);
	}

	function openThemeMenu() {
		isThemeMenuOpen.value = true;
	}

	function openLanguageMenu() {
		isLanguageMenuOpen.value = true;
	}

	const sortedThemes = computed(() => {
		const themes = ThemesConfig.value?.themes ?? [];
		return [...themes].sort((a, b) => {
			const aName = TranslateOrDefault(a.themeName, a.id).toLowerCase();
			const bName = TranslateOrDefault(b.themeName, b.id).toLowerCase();
			return aName.localeCompare(bName, undefined, { sensitivity: "base" });
		});
	});

	const userMenuItems = computed<DropdownMenuItem[][]>(() => {
		const themeItems: DropdownMenuItem[] = sortedThemes.value.map((theme) => ({
			label: TranslateOrDefault(theme.themeName, theme.id),
			type: "checkbox",
			checked: CurrentTheme.value?.id === theme.id,
			onUpdateChecked(checked) {
				if (checked) {
					SetTheme(theme.id);
				}
			},
		}));

		const languageItems: DropdownMenuItem[] = availableLocales.value.map(
			(lang) => ({
				label: lang.language,
				type: "checkbox",
				checked: lang.code === locale.value,
				onUpdateChecked(checked) {
					if (checked) {
						setLang(lang.code);
					}
				},
			}),
		);

		return [
			[
				{
					label: displayName.value,
					type: "label",
				},
			],
			[
				{
					label: t("userMenu.profile"),
					icon: "i-lucide-user",
					onSelect: openProfile,
				},
				{
					label: t("userMenu.theme"),
					icon: "i-lucide-sun-moon",
					onSelect: openThemeMenu,
				},
				{
					label: t("userMenu.language"),
					icon: "i-lucide-languages",
					onSelect: openLanguageMenu,
				},
			],
			[
				{
					label: t("userMenu.logOut"),
					icon: "i-lucide-log-out",
					to: "/logout",
				},
			],
		];
	});
</script>

<template>
	<UDashboardGroup
		class="MemberLayout"
		storage="local"
		storage-key="member-layout"
	>
		<UDashboardSidebar
			collapsible
			mode="drawer"
			resizable
			:min-size="22"
			:default-size="30"
			:max-size="40"
			:ui="{ footer: 'border-t border-default' }"
		>
			<template #resize-handle="{ onMouseDown, onTouchStart, onDoubleClick }">
				<UDashboardResizeHandle
					class="after:absolute after:inset-y-0 after:right-0 after:w-px hover:after:bg-(--ui-border-accented) after:transition"
					@mousedown="onMouseDown"
					@touchstart="onTouchStart"
					@dblclick="onDoubleClick"
				/>
			</template>

			<template #header="{ collapsed }">
				<NuxtLink
					:to="section ? `/${section}` : '/'"
					class="flex items-center gap-2 px-1"
				>
					<img
						src="/images/Logos/Logo.png"
						class="h-8 w-auto"
					>
					<span v-if="!collapsed">CoderDojo Ennis</span>
				</NuxtLink>
			</template>

			<template #default="{ collapsed }">
				<UNavigationMenu
					:collapsed="collapsed"
					:items="primaryNavItems"
					orientation="vertical"
					class="mt-2"
				/>

				<UNavigationMenu
					v-if="secondaryNavItems.length > 0"
					:collapsed="collapsed"
					:items="secondaryNavItems"
					orientation="vertical"
					class="mt-auto"
				/>
			</template>

			<template #footer="{ collapsed }">
				<UDropdownMenu
					:items="userMenuItems"
					:ui="{ content: 'w-(--reka-dropdown-menu-trigger-width)' }"
				>
					<UButton
						:label="collapsed ? undefined : displayName"
						color="neutral"
						variant="ghost"
						class="w-full justify-start"
						:block="collapsed"
						icon="i-lucide-user"
						:trailing-icon="collapsed ? undefined : 'i-lucide-chevrons-up-down'"
						:ui="{
							label: 'flex-1 text-left',
							trailingIcon: 'ml-auto'
						}"
					/>
				</UDropdownMenu>

				<UModal
					v-model:open="isThemeMenuOpen"
					:description="t('theme.description')"
					:title="t('theme.select')"
				>
					<template #body>
						<ButtonsStack>
							<UButton
								v-for="theme in sortedThemes"
								:key="theme.id"
								class="w-full justify-between"
								:variant="CurrentTheme?.id === theme.id ? 'solid' : 'outline'"
								@click="SetTheme(theme.id); isThemeMenuOpen = false"
							>
								<Translated :t="theme.themeName" />
								<Icon
									:name="theme.darkOrLight === 'dark' ? 'line-md:sunny-filled-loop-to-moon-filled-alt-loop-transition' : 'line-md:moon-filled-to-sunny-filled-loop-transition'"
								/>
							</UButton>
						</ButtonsStack>
					</template>
				</UModal>

				<UModal
					v-model:open="isLanguageMenuOpen"
					:description="t('language.description')"
					:title="t('language.select')"
				>
					<template #body>
						<ButtonsStack>
							<UButton
								v-for="lang in availableLocales"
								:key="lang.code"
								class="w-full"
								:variant="lang.code === locale ? 'solid' : 'outline'"
								@click="setLang(lang.code); isLanguageMenuOpen = false"
							>
								{{ lang.language }}
							</UButton>
						</ButtonsStack>
					</template>
				</UModal>
			</template>
		</UDashboardSidebar>

		<UDashboardPanel>
			<template #header>
				<UDashboardNavbar :title="pageTitle">
					<template #toggle>
						<UDashboardSidebarToggle variant="subtle" class="lg:hidden"/>
					</template>
				</UDashboardNavbar>
			</template>

			<template #body>
				<div class="MemberLayoutMain">
					<slot/>
				</div>
			</template>
		</UDashboardPanel>
	</UDashboardGroup>
</template>

<style lang="css"></style>
