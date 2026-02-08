import type { BroadenLiterals } from "#shared/utils/TypeHelpers";

/**
 * English translations
 * Used as the base for other locales
 */
export default {
	attendance: {
		columns: {
			name: "Name",
			photo: "Photo",
			present: "Present",
		},
		footer: {
			chooseRandomCoder: "Choose Random Coder",
		},
		include: {
			allMembers: "All",
			label: "Include",
			presentMembers: "Present",
			registeredMembers: "Registered",
		},
		noMembersSignedIn: "No members signed in",
		sessionDate: "Session Date",
	},
	belts: {
		description: "Belt Description",
		label: "Belt",
		plural: "Belts",
	},
	beltApplications: {
		applicationDate: "Applied",
		applicationNotes: "Notes from applicant",
		empty: "There are no pending belt applications.",
		heading: "Belt Applications",
	},
	coders: {
		label: "Coder",
		plural: "Coders",
	},
	labels: {
		search: "Search",
	},
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
	memberBelt: {
		color: {
			black: "Black",
			blue: "Blue",
			green: "Green",
			red: "Red",
			white: "White",
			yellow: "Yellow",
		},
		label: "{Color}",
		noob: "Noob",
	},
	mentors: {
		label: "Mentor",
		plural: "Mentors",
	},
	nav: {
		Attendance: "Attendance",
		"Badge Categories": "Badge Categories",
		Badges: "Badges",
		"Badges Available": "Badges Available",
		Belts: "Belts",
		"Coder Home": "Coder Home",
		Goals: "Goals",
		Maintenance: "Maintenance",
		Members: "Members",
		"Mentor Email CSV": "Mentor Email CSV",
		"Mentor Home": "Mentor Home",
		Mentors: "Mentors",
		"My Kids": "My Kids",
		"Parent Emails CSV": "Parent Emails CSV",
		"Parent Home": "Parent Home",
		Parents: "Parents",
		"Purge Members": "Purge Members",
		"Purge Registrations": "Purge Registrations",
		"Recent Belts": "Recent Belts",
		"Recent Belts CSV": "Recent Belts CSV",
		Reports: "Reports",
		"Sign In Mode": "Sign In Mode",
		Teams: "Teams",
	},
	parents: {
		label: "Parent",
		plural: "Parents",
	},
	signIn: {
		qrPlaceholder: "Enable the camera to scan a QR code.",
		sessionCount: "1 session | {count} sessions",
		signInButton: "Sign In",
		title: "CoderDojo Ennis Session Sign In",
	},
	teams: {
		label: "Team",
		plural: "Teams",
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
	validation: {
		minLength: "Must be at least {min} characters",
	},
} as const;

/**
 * Type used for validation in other locale files for completeness
 */
export type defaultType = ReturnType<() => typeof import("./en").default>;
export type enMessagesType = BroadenLiterals<defaultType>;
