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
	signIn: {
		title: "CoderDojo Ennis Session Sign In",
		signInButton: "Connexion",
	},
	theme: {
		author: "Créé par {AuthorName}",
		select: "Sélectionnez le thème",
	},
} as const satisfies enMessagesType;
