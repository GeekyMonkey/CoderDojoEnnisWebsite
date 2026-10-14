<script setup lang="ts">
	import type { DropdownMenuItem, NavigationMenuItem } from "@nuxt/ui";
	import type { ComputedRef, Ref } from "vue";
	import type { SupabaseUserMetaType } from "#shared/types/Supabase";
	import type {
		MemberModel,
		MemberSupabaseModel,
	} from "#shared/types/models/MemberModel";
	import { useMyProfileStore } from "~/stores/useMyProfileStore";
	import { provideMemberLayoutContext } from "~/composables/useMemberLayoutContext";
	import {
		buildNavigationModel,
		normaliseNavigationSearch,
		buildRoleNavigationSections,
		getMemberRoles,
		getRoleFlagsFromUserMeta,
		type MemberNavSection,
		type MemberRole,
		type MemberRoleFlags,
	} from "~/utils/memberNavigation";

	type RoleLabels = Record<MemberRole, string>;

	const navigationUi: NonNullable<NavigationMenuItem["ui"]> = {
		link: "MemberNavLink",
		linkLabel: "MemberNavLabel",
		linkLeadingIcon: "MemberNavIcon",
		linkTrailing: "MemberNavTrailing",
		linkTrailingIcon: "MemberNavIcon",
		childLinkLabel: "MemberNavLabel",
	};

	const route: ReturnType<typeof useRoute> = useRoute();
	const router: ReturnType<typeof useRouter> = useRouter();
	const user: ReturnType<typeof useSupabaseUser> = useSupabaseUser();
	const { profile: currentMember } = useMyProfileStore();
	const { locale, t, te } = useI18n();

	const themeSelectRef: Ref<{ isOpen: boolean } | null> = ref(null);
	const languageSelectRef: Ref<{ isOpen: boolean } | null> = ref(null);
	const navigationSearch: Ref<string> = ref("");
	const searchInputRef: Ref<{ inputRef: HTMLInputElement | null } | null> =
		ref(null);

	const section = computed<string | null>(() => {
		const seg = route.path.split("/")[1];
		return seg ? seg : null;
	});

	const roles = computed<MemberRole[]>(() => {
		const meta = (user.value?.user_metadata ??
			null) as SupabaseUserMetaType | null;
		const flags: MemberRoleFlags = currentMember.value
			? {
					isMentor: currentMember.value.isMentor,
					isParent: currentMember.value.isParent,
					isCoder: currentMember.value.isNinja,
				}
			: getRoleFlagsFromUserMeta(meta);
		return getMemberRoles(flags);
	});

	const roleBase: ComputedRef<string> = computed((): string =>
		section.value === "member"
			? `/${roles.value[0] ?? "coder"}`
			: `/${section.value ?? roles.value[0] ?? "coder"}`,
	);
	const sharedNavigation: ComputedRef<NavigationMenuItem[]> = computed(
		(): NavigationMenuItem[] => [
			{
				label: t("nav.Calendar"),
				to: "/member/calendar",
				icon: "i-lucide-calendar",
			},
		],
	);
	const visibleSharedNavigation: ComputedRef<NavigationMenuItem[]> = computed(
		(): NavigationMenuItem[] =>
			sharedNavigation.value.filter((item: NavigationMenuItem): boolean =>
				normaliseNavigationSearch(item.label ?? "", locale.value).includes(
					normaliseNavigationSearch(navigationSearch.value, locale.value),
				),
			),
	);
	const roleLabels: ComputedRef<RoleLabels> = computed((): RoleLabels => ({
		mentor: t("mentors.label"),
		parent: t("parents.label"),
		coder: t("coders.label"),
	}));
	const navSections: ComputedRef<MemberNavSection[]> = computed(
		(): MemberNavSection[] =>
			buildRoleNavigationSections(
				buildNavigationModel(""),
				roles.value,
				translateNavigationLabel,
				locale.value,
			),
	);
	const visibleNavSections: ComputedRef<MemberNavSection[]> = computed(
		(): MemberNavSection[] =>
			buildRoleNavigationSections(
				buildNavigationModel(""),
				roles.value,
				translateNavigationLabel,
				locale.value,
				navigationSearch.value,
			),
	);
	const showRoleHeadings: ComputedRef<boolean> = computed(
		(): boolean => roles.value.length > 1,
	);
	const navigationSearchKey: ComputedRef<string> = computed((): string =>
		navigationSearch.value.trim(),
	);
	const titleByPath: ComputedRef<Map<string, string>> = computed(
		(): Map<string, string> => {
			const map: Map<string, string> = new Map();
			/** Include submenu destinations in the unfiltered page-title lookup. */
			function addItems(items: NavigationMenuItem[]): void {
				for (const item of items) {
					if (typeof item.to === "string") map.set(item.to, item.label ?? "");
					if (item.children) addItems(item.children);
				}
			}
			for (const navSection of navSections.value) addItems(navSection.items);
			addItems(sharedNavigation.value);
			return map;
		},
	);

	const pageTitle = computed(() => {
		return titleByPath.value.get(route.path) || "";
	});

	provideMemberLayoutContext({
		pageTitle,
	});

	const displayName = computed(() => {
		const meta = (user.value?.user_metadata ??
			null) as MemberSupabaseModel | null;
		const member: MemberModel | null = currentMember.value;
		const first = member?.nameFirst ?? meta?.nameFirst;
		const last = member?.nameLast ?? meta?.nameLast;
		const full = [first, last].filter(Boolean).join(" ");
		return full || user.value?.email || "User";
	});

	/** Translate a navigation label when a locale entry exists. */
	function translateNavigationLabel(label: string): string {
		const key: string = `nav.${label}`;
		return te(key) ? t(key) : label;
	}

	/** Clear the filter and keep keyboard focus in the search field. */
	function clearNavigationSearch(): void {
		navigationSearch.value = "";
		searchInputRef.value?.inputRef?.focus();
	}

	/** Open the profile for the current role area. */
	function openProfile(): void {
		const base: string = roleBase.value;
		router.push(`${base}/profile`);
	}

	/** Open theme preferences from the user menu. */
	function openThemeMenu(): void {
		if (themeSelectRef.value) {
			themeSelectRef.value.isOpen = true;
		}
	}

	/** Open language preferences from the user menu. */
	function openLanguageMenu(): void {
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
					:to="roleBase"
					class="flex items-center gap-2 px-1 MemberLayoutHeaderLogo"
				>
					<img src="/images/Logos/Logo.png" class="h-8 w-8 CoderDojoLogo" />
					<span v-if="!collapsed">CoderDojo Ennis</span>
				</NuxtLink>
			</template>

			<template #default="{ collapsed, collapse }">
				<div class="MemberNavigation">
					<UButton
						v-if="collapsed"
						icon="i-lucide-search"
						color="neutral"
						variant="ghost"
						:aria-label="t('navigation.filter')"
						@click="collapse(false)"
					/>
					<UInput
						v-else
						ref="searchInputRef"
						v-model="navigationSearch"
						class="MemberNavSearch"
						icon="i-lucide-search"
						:placeholder="t('navigation.filter')"
						:aria-label="t('navigation.filter')"
						autocomplete="off"
						@keydown.esc.stop="clearNavigationSearch"
					>
						<template v-if="navigationSearch" #trailing>
							<UButton
								icon="i-lucide-x"
								color="neutral"
								variant="link"
								size="xs"
								:aria-label="t('navigation.clear')"
								@click="clearNavigationSearch"
							/>
						</template>
					</UInput>
					<section
						v-for="navSection in visibleNavSections"
						:key="navSection.role"
						class="MemberNavSection"
						:class="{ MemberNavRoleSection: showRoleHeadings }"
						:aria-label="roleLabels[navSection.role]"
					>
						<h2
							v-if="showRoleHeadings && !collapsed"
							class="MemberNavRoleHeading"
						>
							{{ roleLabels[navSection.role] }}
						</h2>
						<UNavigationMenu
							:key="`${navSection.role}:${navigationSearchKey}`"
							:collapsed="collapsed"
							:items="navSection.items"
							:ui="navigationUi"
							orientation="vertical"
						/>
					</section>
					<p
						v-if="!visibleNavSections.length && !visibleSharedNavigation.length"
						class="MemberNavEmpty"
						role="status"
					>
						{{ t("navigation.noMatches") }}
					</p>
				</div>
			</template>

			<template #footer="{ collapsed }">
				<div class="MemberNavFooter">
					<UNavigationMenu
						v-if="visibleSharedNavigation.length"
						:items="visibleSharedNavigation"
						:collapsed="collapsed"
						:ui="navigationUi"
						orientation="vertical"
						class="MemberSharedNavigation"
					/>
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
							:trailing-icon="
								collapsed ? undefined : 'i-lucide-chevrons-up-down'
							"
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
				</div>
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

<style scoped lang="scss">
	.MemberNavigation {
		display: flex;
		flex-direction: column;
		gap: calc(var(--spacing) * 2);
		min-width: 0;
	}
	.MemberNavFooter {
		display: flex;
		flex-direction: column;
		width: 100%;
		gap: calc(var(--spacing) * 2);
	}
	.MemberSharedNavigation {
		width: 100%;
	}
	.MemberNavSearch {
		width: 100%;
	}
	.MemberNavSection {
		min-width: 0;
	}
	.MemberNavRoleSection + .MemberNavRoleSection {
		border-top: 1px solid var(--ui-border);
		margin-top: calc(var(--spacing) * 2);
		padding-top: calc(var(--spacing) * 2);
	}
	.MemberNavRoleHeading {
		margin: 0;
		padding: calc(var(--spacing) * 2);
		color: var(--ui-text-dimmed);
		font-size: var(--text-xs);
		font-weight: 700;
		letter-spacing: 0.06em;
		text-align: center;
		text-transform: uppercase;
	}
	.MemberNavEmpty {
		color: var(--ui-text-muted);
		font-size: var(--text-sm);
		padding: calc(var(--spacing) * 2);
	}
	:deep(.MemberNavLink) {
		align-items: center;
	}
	:deep(.MemberNavLabel) {
		white-space: normal;
		overflow-wrap: anywhere;
		overflow: visible;
		text-overflow: clip;
		line-height: 1.1;
	}
	:deep(.MemberNavIcon),
	:deep(.MemberNavTrailing) {
		align-self: center;
	}
</style>
