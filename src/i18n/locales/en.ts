import type { BroadenLiterals } from "~~/shared/utils/TypeHelpers";

/**
 * English translations
 * Used as the base for other locales
 */
export default {
	language: {
		current: "Current language: {Language}",
		description: "Select your preferred language",
		select: "Select language",
	},
	login: {
		loginButton: "Login",
		password: "Password",
		title: "CoderDojo Ennis Member Login",
		username: "Username",
	},
	nav: {
		"Attendance": "Attendance",
		"Badge Categories": "Badge Categories",
		"Badges": "Badges",
		"Badges Available": "Badges Available",
		"Belts": "Belts",
		"Child 1": "Child 1",
		"Child 2": "Child 2",
		"Coder Home": "Coder Home",
		"Goals": "Goals",
		"Maintenance": "Maintenance",
		"Members": "Members",
		"Mentor Email CSV": "Mentor Email CSV",
		"Mentor Home": "Mentor Home",
		"Mentors": "Mentors",
		"My Kids": "My Kids",
		"Parent Emails CSV": "Parent Emails CSV",
		"Parent Home": "Parent Home",
		"Parents": "Parents",
		"Purge Members": "Purge Members",
		"Purge Registrations": "Purge Registrations",
		"Recent Belts": "Recent Belts",
		"Recent Belts CSV": "Recent Belts CSV",
		"Reports": "Reports",
		"Sign In Mode": "Sign In Mode",
		"Teams": "Teams",
	},
	signIn: {
		signInButton: "Sign In",
		title: "CoderDojo Ennis Session Sign In",
	},
	theme: {
		author: "Created by {AuthorName}",
		description: "Choose your preferred theme",
		select: "Select Theme",
	},
	userMenu: {
		language: "Language",
		logOut: "Log out",
		profile: "Profile",
		theme: "Theme",
	},
	attendance: {
		sessionDate: "Session Date",
		include: {
			label: "Include",
			presentMembers: "Present Members",
			registeredMembers: "Registered Members",
			allMembers: "All Members",
		},
		search: {
			label: "Search",
			placeholder: "Search members…",
		},
		columns: {
			present: "Present",
			name: "Name",
			photo: "Photo",
			team: "Team",
			beltColor: "Belt Color",
		},
		footer: {
			chooseRandomCoder: "Choose Random Coder",
		},
		loadingRoster: "Loading roster…",
		errorLoadingRoster: "Error loading roster.",
		codersTitle: "Coders",
		mentorsTitle: "Mentors",
	},
	validation: {
		minLength: "Must be at least {min} characters",
	},
} as const;

/**
 * Type used for validation in other locale files for completeness
 */
export type defaultType = ReturnType<() => typeof import("./en").default>;
export type enMessagesType = BroadenLiterals<defaultType>;
