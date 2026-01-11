import { type enMessagesType } from "./en";

/**
 * French translations
 * Requires all keys from enMessagesType
 */
export default {
	login: {
		title: "CoderDojo Ennis Membre Connexion",
		username: "Nom d'utilisateur",
		password: "Mot de passe",
		loginButton: "Connexion",
	},
	validation: {
		minLength: "Doit contenir au moins {min} caractères",
	},
	signIn: {
		title: "Connexion à la session CoderDojo Ennis",
		signInButton: "Connexion",
	},
	theme: {
		author: "Créé par {AuthorName}",
		select: "Sélectionnez le thème",
		description: "Choisissez votre thème préféré",
	},
	language: {
		select: "Choisir la langue",
		description: "Sélectionnez votre langue préférée",
		current: "Langue actuelle : {Language}",
	},
} as const satisfies enMessagesType;
