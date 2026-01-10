import { type enMessagesType } from "./en";

/**
 * Irish translations
 * Requires all keys from enMessagesType
 */
export default {
	login: {
		title: "Logáil Isteach Comhaltaí CoderDojo Ennis",
		username: "Ainm Úsáideora",
		password: "Pasfhocal",
		loginButton: "Logáil Isteach",
	},
	validation: {
		minLength: "Ní mór {min} carachtar ar a laghad",
	},
	signIn: {
		title: "Logáil Isteach Cód Cinnte CoderDojo Ennis",
		signInButton: "Logáil Isteach",
	},
	theme: {
		author: "Cruthaitheoir: {AuthorName}",
		select: "Roghnaigh Téama",
		description: "Roghnaigh do théama is fearr leat",
	},
	language: {
		select: "Roghnaigh teanga",
		description: "Roghnaigh do theanga is fearr leat",
		current: "Teanga reatha: {Language}",
	},
} as const satisfies enMessagesType;
