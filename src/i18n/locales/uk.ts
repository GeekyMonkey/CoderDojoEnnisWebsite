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
	signIn: {
		title: "Реєстрація на сесію CoderDojo Ennis",
		signInButton: "Увійти",
	},
	theme: {
		author: "Створено {AuthorName}",
		select: "Виберіть тему",
	},
} as const satisfies enMessagesType;
