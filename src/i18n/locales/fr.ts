import { type enMessagesType } from "./en";

/**
 * French translations
 * Requires all keys from enMessagesType
 */
export default {
	language: {
		current: "Langue actuelle : {Language}",
		description: "Sélectionnez votre langue préférée",
		select: "Choisir la langue",
	},
	login: {
		loginButton: "Connexion",
		password: "Mot de passe",
		title: "CoderDojo Ennis Membre Connexion",
		username: "Nom d'utilisateur",
	},
	nav: {
		"Attendance": "Présence",
		"Badge Categories": "Catégories de badges",
		"Badges": "Badges",
		"Badges Available": "Badges disponibles",
		"Belts": "Ceintures",
		"Child 1": "Enfant 1",
		"Child 2": "Enfant 2",
		"Coder Home": "Accueil codeur",
		"Goals": "Objectifs",
		"Maintenance": "Maintenance",
		"Members": "Membres",
		"Mentor Email CSV": "Emails des mentors (CSV)",
		"Mentor Home": "Accueil mentor",
		"Mentors": "Mentors",
		"My Kids": "Mes enfants",
		"Parent Emails CSV": "Emails des parents (CSV)",
		"Parent Home": "Accueil parents",
		"Parents": "Parents",
		"Purge Members": "Purger les membres",
		"Purge Registrations": "Purger les inscriptions",
		"Recent Belts": "Ceintures récentes",
		"Recent Belts CSV": "Ceintures récentes (CSV)",
		"Reports": "Rapports",
		"Sign In Mode": "Mode d'inscription",
		"Teams": "Équipes",
	},
	signIn: {
		signInButton: "Connexion",
		title: "Connexion à la session CoderDojo Ennis",
	},
	theme: {
		author: "Créé par {AuthorName}",
		description: "Choisissez votre thème préféré",
		select: "Sélectionnez le thème",
	},
	userMenu: {
		language: "Langue",
		logOut: "Se déconnecter",
		profile: "Profil",
		theme: "Thème",
	},
	validation: {
		minLength: "Doit contenir au moins {min} caractères",
	},
} as const satisfies enMessagesType;
