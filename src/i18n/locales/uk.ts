import { type enMessagesType } from "./en";

/**
 * Ukrainian translations
 * Requires all keys from enMessagesType
 */
export default {
	login: {
		title: "Вхід для учасників CoderDojo Ennis",
		username: "Ім'я користувача",
		password: "Пароль",
		loginButton: "Увійти",
	},
	validation: {
		minLength: "Має містити щонайменше {min} символи",
	},
	signIn: {
		title: "Реєстрація на сесію CoderDojo Ennis",
		signInButton: "Увійти",
	},
	theme: {
		author: "Створено {AuthorName}",
		select: "Виберіть тему",
		description: "Виберіть бажану тему",
	},
	language: {
		select: "Виберіть мову",
		description: "Виберіть бажану мову",
		current: "Поточна мова: {Language}",
	},
} as const satisfies enMessagesType;
