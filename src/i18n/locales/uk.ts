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
		Resources: "Ресурси",
		"Sign In Mode": "Режим реєстрації",
		Teams: "Команди",
		"This Week": "Цей тиждень",
		VEX: "Робототехніка VEX",
		"VEX Home": "Головна VEX",
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
	vex: {
		actions: {
			addResource: "Додати ресурс",
			addTask: "Додати завдання",
			cancel: "Скасувати",
			delete: "Прибрати",
			edit: "Редагувати",
			editObjective: "Редагувати цей тиждень",
			editSeason: "Редагувати сезон",
			joinTask: "Я допоможу",
			leaveTask: "Вийти",
			newSeason: "Новий сезон",
			newSprint: "Почати наступний тиждень",
			openWorkspace: "Відкрити робочий простір цього тижня",
			save: "Зберегти",
			seeAllResources: "Усі ресурси",
		},
		common: {
			loadError: "Не вдалося завантажити робочий простір VEX: {error}",
			loading: "Завантаження…",
			noSeason: "Сезон VEX ще не створено.",
			saveError: "Не вдалося зберегти: {error}",
		},
		home: {
			currentSeason: "Поточний сезон",
			gettingStarted: "З чого почати",
			gettingStartedText:
				"Не знаєш, з чого почати? Вибери тему нижче або почни у VEXcode VR – робот для цього не потрібен.",
			howItWorks: {
				heading: "Як це працює",
				steps: {
					step1: "Ментор ставить ціль на тиждень",
					step2: "Разом вирішуємо, що треба зробити",
					step3: "Кожен бере відповідальність за щось",
					step4: "Працюємо над цим у Dojo і протягом тижня",
					step5: "Наступної суботи показуємо, що ми дізналися",
				},
			},
			intro: {
				p1: "Ми збираємо команду CoderDojo Ennis, щоб узяти участь у змаганнях з робототехніки VEX IQ.",
				p2: "Це не щотижневий урок робототехніки. Щотижня ми домовляємося про ціль, з'ясовуємо, що треба зробити, розподіляємо завдання, пробуємо різне протягом тижня і наступної суботи розповідаємо команді, що дізналися.",
				p3: "Іноді це програмування. Іноді – вивчення правил змагань, перевірка стратегії, конструювання частини робота, дослідження ідеї, тренування з керування, опис чогось або допомога товаришу по команді, який застряг.",
				p4: "Мета – разом зрозуміти, як впоратися із завданням.",
			},
			noSprint: "Ціль на цей тиждень ще не встановлено.",
			previousSeasons: "Попередні сезони",
			previousWeeks: "Попередні тижні",
			thisWeek: "Цей тиждень",
			title: "Команда з робототехніки VEX",
		},
		resources: {
			categories: {
				competition: {
					intro: "Що це за гра, які правила і як оцінюють команди.",
					label: "Змагання",
				},
				"design-building": {
					intro: "Як збирати роботів, та ідеї для механізмів.",
					label: "Конструювання робота",
				},
				"driving-strategy": {
					intro: "Тренування з керування і як набирати бали.",
					label: "Керування і стратегія",
				},
				programming: {
					intro: "Пишемо код для робота.",
					label: "Програмування",
				},
				"vex-iq": {
					intro: "Сам набір: Brain, мотори, датчики і контролер.",
					label: "VEX IQ",
				},
				"vexcode-vr": {
					intro: "Тренуйся програмувати віртуального робота – набір не потрібен.",
					label: "VEXcode VR / Virtual Skills",
				},
				"videos-references": {
					intro: "Відео та інші корисні матеріали.",
					label: "Корисні відео / матеріали",
				},
			},
			empty: "Тут поки нічого немає.",
			fields: {
				category: "Категорія",
				description: "Короткий опис",
				isActive: "Показувати учасникам",
				resourceType: "Тип",
				season: "Сезон",
				seasonGeneral: "Усі сезони",
				sortOrder: "Порядок",
				title: "Назва",
				url: "Посилання",
			},
			form: {
				editTitle: "Редагувати ресурс",
				newTitle: "Додати ресурс",
			},
			hidden: "Приховано",
			intro: "Хочеш працювати над VEX, але не знаєш, з чого почати? Ці посилання згруповані за темами, без певного порядку. Вибери те, що допоможе з ціллю цього тижня.",
			title: "Ресурси",
			types: {
				document: "Документ",
				forum: "Форум",
				tool: "Інструмент",
				video: "Відео",
				website: "Вебсайт",
			},
			vr: {
				heading: "Ще немає робота? Почни у VEXcode VR",
				p1: "Справжнього набору VEX IQ у нас, мабуть, не буде перші кілька тижнів. Нічого страшного – ти можеш почати просто зараз у браузері.",
				p2: "Майданчик Level Up Virtual Skills у VEXcode VR має віртуальне поле для змагань і віртуального робота, тож ти можеш тренуватися в автономному програмуванні (код, який сам керує роботом).",
				p3: "У VEX також є Virtual Driving Skills, але щоб так керувати віртуальним роботом, потрібен справжній контролер VEX IQ (2-го покоління), підключений до комп'ютера. Клавіатура й миша його не замінять.",
				p4: "Для майданчика змагань може знадобитися реєстрація команди у VEX. Якщо тебе просять увійти або оновити підписку, звернися до ментора. Усе, чого ти навчишся, знадобиться на справжньому роботі, коли він прибуде.",
			},
		},
		season: {
			fields: {
				competitionName: "Назва змагань / гри",
				description: "Опис",
				endDate: "Дата завершення",
				isCurrent: "Це поточний сезон",
				programName: "Програма",
				seasonLabel: "Сезон (напр. 2027–28)",
				slug: "Коротка назва для вебадреси (напр. 2027-28-game-name)",
				startDate: "Дата початку",
			},
			form: {
				editTitle: "Редагувати сезон",
				newTitle: "Новий сезон",
			},
			notFound: "Цей сезон не знайдено.",
			weeks: "Тижні",
		},
		sprint: {
			carryOver: "Не завершено – перенести на наступний тиждень?",
			dates: {
				review: "Огляд",
				start: "Dojo",
			},
			fields: {
				mentorNotes: "Додаткові нотатки (необов'язково)",
				objective: "Головна ціль тижня",
				objectivePlaceholder:
					"Чого команда має спробувати досягти до наступної суботи?",
				reviewDate: "Дата огляду",
				sprintNumber: "Номер тижня",
				startDate: "Дата Dojo",
				status: "Статус",
				statusHelp:
					"Якщо позначити тиждень як «Поточний», попередній поточний тиждень стане «Завершеним».",
				title: "Коротка назва (необов'язково)",
			},
			findings: {
				empty: "Ще ніхто нічого не записав. Додай нотатки до завдання, щоб поділитися тим, що дізнався.",
				heading: "Що ми дізналися?",
				hint: "Нотатки, посилання й відкриття з кожного завдання – знадобляться для суботнього огляду.",
			},
			form: {
				editTitle: "Редагувати тиждень {number}",
				newTitle: "Почати новий тиждень",
			},
			mentorNotes: "Нотатки від менторів",
			noObjective: "Ціль на цей тиждень ще не встановлено.",
			notFound: "Цей тиждень не знайдено.",
			objectiveHeading: "Наша ціль на цей тиждень",
			progress: "Виконано {done} з {total}",
			status: {
				complete: "Завершений",
				current: "Поточний",
				planned: "Запланований",
			},
			tasks: {
				empty: "Завдань ще немає. Як думаєш, що треба зробити? Додай перше!",
				heading: "Що, на нашу думку, треба зробити?",
				hint: "Додай завдання, про які домовилася команда, і впиши своє ім'я біля тих, за які відповідаєш.",
			},
			weekNumber: "Тиждень {number}",
		},
		task: {
			fields: {
				link: "Корисне посилання (необов'язково)",
				notes: "Нотатки / що ми дізналися",
				notesPlaceholder:
					"Що ти пробував? Що спрацювало? Що ні? Що варто знати команді?",
				owners: "Хто відповідає?",
				ownersPlaceholder: "Вибери людей",
				status: "Статус",
				title: "Що треба зробити?",
			},
			form: {
				editTitle: "Редагувати завдання",
				newTitle: "Додати завдання",
			},
			nobody: "Поки ніхто",
			status: {
				done: "Виконано",
				in_progress: "У процесі",
				todo: "Треба зробити",
			},
		},
	},
} as const satisfies enMessagesType;
