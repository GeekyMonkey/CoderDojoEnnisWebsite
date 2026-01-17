import { type enMessagesType } from "./en";

/**
 * Irish translations
 * Requires all keys from enMessagesType
 * spell-checker:ignoreRegExp ".*"
 */
export default {
	attendance: {
		sessionDate: "Dáta Seisiúin",
		include: {
			label: "Cuir san áireamh",
			presentMembers: "Anseo",
			registeredMembers: "Cláraithe",
			allMembers: "Gach",
		},
		search: {
			label: "Cuardaigh",
			placeholder: "",
		},
		columns: {
			present: "Anseo",
			coder: "Códóir",
			mentor: "Meantóir",
			name: "Ainm",
			photo: "Grianghraf",
			team: "Foireann",
			beltColor: "Crios",
		},
		footer: {
			chooseRandomCoder: "Roghnaigh códóir go randamach",
		},
		loadingRoster: "Ag lódáil an liosta…",
		errorLoadingRoster: "Earráid ag lódáil an liosta.",
		codersTitle: "Códóirí",
		mentorsTitle: "Meantóirí",
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
		parent: "Tuismitheoir",
		mentor: "Meantóir",
		noob: "Tosaitheoir",
		color: {
			white: "Bán",
			yellow: "Buí",
			green: "Glas",
			blue: "Gorm",
			red: "Dearg",
			black: "Dubh",
		},
		label: "{Color}",
	},
	nav: {
		"Attendance": "Tinreamh",
		"Badge Categories": "Catagóirí Suaitheantais",
		"Badges": "Suaitheantais",
		"Badges Available": "Suaitheantais ar Fáil",
		"Belts": "Criosanna",
		"Coder Home": "Baile an Chódóra",
		"Goals": "Spriocanna",
		"Maintenance": "Cothabháil",
		"Members": "Baill",
		"Mentor Email CSV": "Ríomhphoist Meantóirí (CSV)",
		"Mentor Home": "Baile an Mheantóra",
		"Mentors": "Meantóirí",
		"My Kids": "Mo Pháistí",
		"Parent Emails CSV": "Ríomhphoist Tuismitheoirí (CSV)",
		"Parent Home": "Baile na dTuismitheoirí",
		"Parents": "Tuismitheoirí",
		"Purge Members": "Glan Baill",
		"Purge Registrations": "Glan Clárúcháin",
		"Recent Belts": "Criosanna le Déanaí",
		"Recent Belts CSV": "Criosanna le Déanaí (CSV)",
		"Reports": "Tuarascálacha",
		"Sign In Mode": "Mód Sínithe Isteach",
		"Teams": "Foirne",
	},
	signIn: {
		sessionCount: "1 seisiún | {count} seisiúin",
		signInButton: "Logáil Isteach",
		title: "Logáil Isteach Cód Cinnte CoderDojo Ennis",
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
