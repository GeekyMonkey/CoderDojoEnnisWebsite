import { type enMessagesType } from "./en";

/**
 * Irish translations
 * Requires all keys from enMessagesType
 * spell-checker:ignoreRegExp ".*"
 */
export default {
	attendance: {
		columns: {
			name: "Ainm",
			photo: "Grianghraf",
			present: "Anseo",
		},
		footer: {
			chooseRandomCoder: "Roghnaigh códóir go randamach",
		},
		include: {
			allMembers: "Gach",
			label: "Cuir san áireamh",
			presentMembers: "Anseo",
			registeredMembers: "Cláraithe",
		},
		noMembersSignedIn: "Gan aon bhall sínithe isteach",
		sessionDate: "Dáta Seisiúin",
	},
	belts: {
		description: "Tuairisc Crios",
		label: "Crios",
		plural: "Criosanna",
	},
	beltApplications: {
		applicationDate: "Curtha isteach",
		applicationNotes: "Nótaí",
		empty: "Níl aon iarratais chriosanna ar feitheamh.",
		heading: "Iarratais ar Chriosanna",
	},
	coders: {
		label: "Códóir",
		plural: "Códóirí",
	},
	labels: {
		search: "Cuardaigh",
	},
	language: {
		current: "Teanga reatha: {Language}",
		description: "Roghnaigh do theanga is fearr leat",
		select: "Roghnaigh teanga",
	},
	login: {
		loginButton: "Logáil Isteach",
		password: "Pasfhocal",
		title: "Logáil Isteach Comhaltaí CoderDojo Ennis",
		username: "Ainm Úsáideora",
	},
	memberBelt: {
		color: {
			black: "Dubh",
			blue: "Gorm",
			green: "Glas",
			red: "Dearg",
			white: "Bán",
			yellow: "Buí",
		},
		label: "{Color}",
		noob: "Tosaitheoir",
	},
	mentors: {
		label: "Meantóir",
		plural: "Meantóirí",
	},
	nav: {
		Attendance: "Tinreamh",
		"Badge Categories": "Catagóirí Suaitheantais",
		Badges: "Suaitheantais",
		"Badges Available": "Suaitheantais ar Fáil",
		Belts: "Criosanna",
		"Coder Home": "Baile an Chódóra",
		Goals: "Spriocanna",
		Maintenance: "Cothabháil",
		Members: "Baill",
		"Mentor Email CSV": "Ríomhphoist Meantóirí (CSV)",
		"Mentor Home": "Baile an Mheantóra",
		Mentors: "Meantóirí",
		"My Kids": "Mo Pháistí",
		"Parent Emails CSV": "Ríomhphoist Tuismitheoirí (CSV)",
		"Parent Home": "Baile na dTuismitheoirí",
		Parents: "Tuismitheoirí",
		"Purge Members": "Glan Baill",
		"Purge Registrations": "Glan Clárúcháin",
		"Recent Belts": "Criosanna le Déanaí",
		"Recent Belts CSV": "Criosanna le Déanaí (CSV)",
		Reports: "Tuarascálacha",
		"Sign In Mode": "Mód Sínithe Isteach",
		Teams: "Foirne",
	},
	parents: {
		label: "Tuismitheoir",
		plural: "Tuismitheoirí",
	},
	signIn: {
		qrPlaceholder: "Cumasaigh an ceamara chun cód QR a scanadh.",
		sessionCount: "1 seisiún | {count} seisiúin",
		signInButton: "Logáil Isteach",
		title: "Logáil Isteach Cód Cinnte CoderDojo Ennis",
	},
	teams: {
		label: "Foireann",
		plural: "Foirne",
	},
	theme: {
		author: "Cruthaitheoir: {AuthorName}",
		description: "Roghnaigh do théama is fearr leat",
		select: "Roghnaigh Téama",
	},
	userMenu: {
		language: "Teanga",
		logOut: "Logáil amach",
		profile: "Próifíl",
		theme: "Téama",
	},
	validation: {
		minLength: "Ní mór {min} carachtar ar a laghad",
	},
} as const satisfies enMessagesType;
