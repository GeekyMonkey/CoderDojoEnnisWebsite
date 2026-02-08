import { type enMessagesType } from "./en";

/**
 * Ukrainian translations
 * Requires all keys from enMessagesType
 * spell-checker:ignoreRegExp ".*"
 */
export default {
	attendance: {
		columns: {
			name: "Ім'я",
			photo: "Фото",
			present: "Присутній",
		},
		footer: {
			chooseRandomCoder: "Вибрати випадкового кодера",
		},
		include: {
			allMembers: "Усі",
			label: "Включити",
			presentMembers: "Присутні",
			registeredMembers: "Зареєстровані",
		},
		noMembersSignedIn: "Жодних членів не виконано вхід",
		sessionDate: "Дата сесії",
	},
	belts: {
		description: "Опис пояса",
		label: "Пояс",
		plural: "Пояси",
	},
	beltApplications: {
		applicationDate: "Подано",
		applicationNotes: "Нотатки",
		empty: "Немає заявок на пояси, що очікують.",
		heading: "Заявки на пояси",
	},
	coders: {
		label: "Кодер",
		plural: "Кодери",
	},
	labels: {
		search: "Пошук",
	},
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
	memberBelt: {
		color: {
			black: "Чорний",
			blue: "Синій",
			green: "Зелений",
			red: "Червоний",
			white: "Білий",
			yellow: "Жовтий",
		},
		label: "{Color}",
		noob: "Новачок",
	},
	mentors: {
		label: "Ментор",
		plural: "Ментори",
	},
	nav: {
		Attendance: "Відвідуваність",
		"Badge Categories": "Категорії бейджів",
		Badges: "Бейджі",
		"Badges Available": "Доступні бейджі",
		Belts: "Пояси",
		"Coder Home": "Головна (Кодер)",
		Goals: "Цілі",
		Maintenance: "Обслуговування",
		Members: "Учасники",
		"Mentor Email CSV": "Email менторів (CSV)",
		"Mentor Home": "Головна (Ментор)",
		Mentors: "Ментори",
		"My Kids": "Мої діти",
		"Parent Emails CSV": "Email батьків (CSV)",
		"Parent Home": "Головна (Батьки)",
		Parents: "Батьки",
		"Purge Members": "Очистити учасників",
		"Purge Registrations": "Очистити реєстрації",
		"Recent Belts": "Останні пояси",
		"Recent Belts CSV": "Останні пояси (CSV)",
		Reports: "Звіти",
		"Sign In Mode": "Режим реєстрації",
		Teams: "Команди",
	},
	parents: {
		label: "Батьки",
		plural: "Батьки",
	},
	signIn: {
		qrPlaceholder: "Увімкніть камеру, щоб сканувати QR-код.",
		sessionCount: "1 сесія | {count} сесій",
		signInButton: "Увійти",
		title: "Реєстрація на сесію CoderDojo Ennis",
	},
	teams: {
		label: "Команда",
		plural: "Команди",
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
