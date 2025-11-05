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
	signIn: {
		title: "Logáil Isteach Cód Cinnte CoderDojo Ennis",
		signInButton: "Logáil Isteach",
	},
	theme: {
		author: "Cruthaitheoir: {AuthorName}",
		select: "Roghnaigh Téama",
	},
} as const satisfies enMessagesType;
