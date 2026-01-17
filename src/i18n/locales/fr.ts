import { type enMessagesType } from "./en";

/**
 * French translations
 * Requires all keys from enMessagesType
 * spell-checker:locale en,fr
 * spell-checker:ignoreRegExp ".*"
*/
export default {
	attendance: {
		sessionDate: "Date de session",
		include: {
			label: "Inclure",
			presentMembers: "Présents",
			registeredMembers: "Inscrits",
			allMembers: "Tous",
		},
		search: {
			label: "Rechercher",
			placeholder: "",
		},
		columns: {
			present: "Présent",
			coder: "Codeur",
			mentor: "Mentor",
			name: "Nom",
			photo: "Photo",
			team: "Équipe",
			beltColor: "Ceinture",
		},
		footer: {
			chooseRandomCoder: "Choisir un codeur au hasard",
		},
		loadingRoster: "Chargement de la liste…",
		errorLoadingRoster: "Erreur de chargement de la liste.",
		codersTitle: "Codeurs",
		mentorsTitle: "Mentors",
	},
	language: {
		current: "Langue actuelle : {Language}",
		description: "Sélectionnez votre langue préférée",
		select: "Choisir la langue",
	},
	login: {
		loginButton: "Connexion",
		password: "Mot de passe",
		title: "Connexion membre CoderDojo Ennis",
		username: "Nom d'utilisateur",
	},
	memberBelt: {
		parent: "Parent",
		mentor: "Mentor",
		noob: "Novice",
		color: {
			white: "Blanc",
			yellow: "Jaune",
			green: "Vert",
			blue: "Bleu",
			red: "Rouge",
			black: "Noir",
		},
		label: "{Color}",
	},
	nav: {
		"Attendance": "Présence",
		"Badge Categories": "Catégories de badges",
		"Badges": "Badges",
		"Badges Available": "Badges disponibles",
		"Belts": "Ceintures",
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
		sessionCount: "1 session | {count} sessions",
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
