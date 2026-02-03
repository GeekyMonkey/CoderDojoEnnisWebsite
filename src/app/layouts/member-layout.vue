<script setup lang="ts">
	import type { DropdownMenuItem, NavigationMenuItem } from "@nuxt/ui";
	import type { SupabaseUserMetaType } from "~~/shared/types/Supabase";
	import type { MemberSupabaseModel } from "~~/shared/types/models/MemberModel";
	import { provideMemberLayoutContext } from "~/composables/useMemberLayoutContext";
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
	const { CurrentTheme, SetTheme, ThemesConfig } = useUiConfig();
	const { locale, setLocale, setLocaleCookie, locales, t, te } = useI18n();

	const themeSelectRef = ref<{ isOpen: Ref<boolean> } | null>(null);
	const languageSelectRef = ref<{ isOpen: Ref<boolean> } | null>(null);

	const section = computed<string | null>(() => {
		const seg = route.path.split("/")[1];
		return seg ? seg : null;
	});

	const roles = computed<MemberRole[]>(() => {
		const meta = (user.value?.user_metadata ??
			null) as SupabaseUserMetaType | null;
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

	provideMemberLayoutContext({
		pageTitle,
	});

	const displayName = computed(() => {
		const meta = (user.value?.user_metadata ??
			null) as MemberSupabaseModel | null;
		const first = meta?.nameFirst;
		const last = meta?.nameLast;
		const full = [first, last].filter(Boolean).join(" ");
		return full || user.value?.email || "User";
	});

	function openProfile() {
		const base = section.value ? `/${section.value}` : "";
		router.push(`${base}/profile`);
	}

	function openThemeMenu() {
		if (themeSelectRef.value) {
			themeSelectRef.value.isOpen = true;
		}
	}

	function openLanguageMenu() {
		if (languageSelectRef.value) {
			languageSelectRef.value.isOpen = true;
		}
	}

	const userMenuItems = computed<DropdownMenuItem[][]>(() => {
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
		:persistent="false"
		storage="local"
		storage-key="member-layout"
		unit="px"
	>
		<UDashboardSidebar
			collapsible
			mode="drawer"
			:min-size="210"
			:default-size="210"
			:max-size="210"
			:ui="{ header: 'hidden lg:block', footer: 'border-t border-default' }"
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
					class="flex items-center gap-2 px-1 MemberLayoutHeaderLogo"
				>
					<img src="/images/Logos/Logo.png" class="h-8 w-8 CoderDojoLogo" />
					<span v-if="!collapsed">CoderDojo Ennis</span>
				</NuxtLink>
			</template>

			<template #default="{ collapsed }">
				<UNavigationMenu
					:collapsed="collapsed"
					:items="primaryNavItems"
					:ui="{
						link: 'items-center',
						linkLabel:
							'whitespace-normal wrap-break-word overflow-visible text-clip leading-[1.1]',
						linkLeadingIcon: 'self-center',
						linkTrailing: 'self-center',
						linkTrailingIcon: 'self-center',
					}"
					orientation="vertical"
					class="mt-2"
				/>

				<UNavigationMenu
					v-if="secondaryNavItems.length > 0"
					:collapsed="collapsed"
					:items="secondaryNavItems"
					:ui="{
						link: 'items-center',
						linkLabel:
							'whitespace-normal wrap-break-word overflow-visible text-clip leading-[1.1]',
						linkLeadingIcon: 'self-center',
						linkTrailing: 'self-center',
						linkTrailingIcon: 'self-center',
					}"
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
						class="w-full justify-start items-center"
						:block="collapsed"
						icon="i-lucide-user"
						:trailing-icon="collapsed ? undefined : 'i-lucide-chevrons-up-down'"
						:ui="{
							label:
								'flex-1 text-left whitespace-normal wrap-break-word leading-[1.1]',
							leadingIcon: 'self-center',
							trailingIcon: 'ml-auto self-center',
						}"
					/>
				</UDropdownMenu>

				<ThemeSelect ref="themeSelectRef" :showTriggerButton="false" />
				<LanguageSelect ref="languageSelectRef" :showTriggerButton="false" />
			</template>
		</UDashboardSidebar>

		<slot />
	</UDashboardGroup>
</template>

<style lang="css">
	div:has(> .MemberLayoutHeaderLogo) {
		border-bottom: solid 1px var(--ui-border);
		display: flex;
	}

	@media (max-width: 800px) {
		div:has(> .MemberLayoutHeaderLogo) {
			display: none;
		}
	}
</style>
