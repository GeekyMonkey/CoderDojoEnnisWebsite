import { type enMessagesType } from "./en";

/**
 * Ukrainian translations
 * Requires all keys from enMessagesType
 */
export default {
	language: {
		current: "Поточна мова: {Language}",
		description: "Виберіть бажану мову",
		select: "Виберіть мову",
	},
	login: {
		loginButton: "Увійти",
		password: "Пароль",
		title: "Вхід для учасників CoderDojo Ennis",
		username: "Ім'я користувача",
	},
	nav: {
		"Attendance": "Відвідуваність",
		"Badge Categories": "Категорії бейджів",
		"Badges Available": "Доступні бейджі",
		"Badges": "Бейджі",
		"Belts": "Пояси",
		"Child 1": "Дитина 1",
		"Child 2": "Дитина 2",
		"Coder Home": "Головна (Кодер)",
		"Goals": "Цілі",
		"Maintenance": "Обслуговування",
		"Members": "Учасники",
		"Mentor Email CSV": "Email менторів (CSV)",
		"Mentor Home": "Головна (Ментор)",
		"Mentors": "Ментори",
		"My Kids": "Мої діти",
		"Parent Emails CSV": "Email батьків (CSV)",
		"Parent Home": "Головна (Батьки)",
		"Parents": "Батьки",
		"Purge Members": "Очистити учасників",
		"Purge Registrations": "Очистити реєстрації",
		"Recent Belts CSV": "Останні пояси (CSV)",
		"Recent Belts": "Останні пояси",
		"Reports": "Звіти",
		"Sign In Mode": "Режим реєстрації",
		"Teams": "Команди",
	},
	signIn: {
		signInButton: "Увійти",
		title: "Реєстрація на сесію CoderDojo Ennis",
	},
	theme: {
		author: "Створено {AuthorName}",
		description: "Виберіть бажану тему",
		select: "Виберіть тему",
	},
	userMenu: {
		language: "Мова",
		logOut: "Вийти",
		profile: "Профіль",
		theme: "Тема",
	},
	validation: {
		minLength: "Має містити щонайменше {min} символи",
	},
} as const satisfies enMessagesType;
