import type { BroadenLiterals } from "~~/shared/utils/TypeHelpers";

/**
 * English translations
 * Used as the base for other locales
 */
export default {
	login: {
		title: "CoderDojo Ennis Member Login",
		username: "Username",
		password: "Password",
		loginButton: "Login",
	},
	validation: {
		minLength: "Must be at least {min} characters",
	},
	signIn: {
		title: "CoderDojo Ennis Session Sign In",
		signInButton: "Sign In",
	},
	theme: {
		author: "Created by {AuthorName}",
		select: "Select Theme",
		description: "Choose your preferred theme",
	},
	language: {
		select: "Select language",
		description: "Select your preferred language",
		current: "Current language: {Language}",
	},
} as const;

/**
 * Type used for validation in other locale files for completeness
 */
export type defaultType = ReturnType<() => typeof import("./en").default>;
export type enMessagesType = BroadenLiterals<defaultType>;
