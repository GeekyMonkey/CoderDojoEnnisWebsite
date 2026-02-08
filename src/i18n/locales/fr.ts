import { type enMessagesType } from "./en";

/**
 * French translations
 * Requires all keys from enMessagesType
 * spell-checker:locale en,fr
 * spell-checker:ignoreRegExp ".*"
 */
export default {
	attendance: {
		columns: {
			name: "Nom",
			photo: "Photo",
			present: "Présent",
		},
		footer: {
			chooseRandomCoder: "Choisir un codeur au hasard",
		},
		include: {
			allMembers: "Tous",
			label: "Inclure",
			presentMembers: "Présents",
			registeredMembers: "Inscrits",
		},
		noMembersSignedIn: "Aucun membre signé",
		sessionDate: "Date de session",
	},
	belts: {
		description: "Description de la ceinture",
		label: "Ceinture",
		plural: "Ceintures",
	},
	beltApplications: {
		applicationDate: "Demandée",
		applicationNotes: "Notes",
		empty: "Aucune demande de ceinture en attente.",
		heading: "Demandes de ceinture",
	},
	coders: {
		label: "Codeur",
		plural: "Codeurs",
	},
	labels: {
		search: "Rechercher",
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
		color: {
			black: "Noir",
			blue: "Bleu",
			green: "Vert",
			red: "Rouge",
			white: "Blanc",
			yellow: "Jaune",
		},
		label: "{Color}",
		noob: "Novice",
	},
	mentors: {
		label: "Mentor",
		plural: "Mentors",
	},
	nav: {
		Attendance: "Présence",
		"Badge Categories": "Catégories de badges",
		Badges: "Badges",
		"Badges Available": "Badges disponibles",
		Belts: "Ceintures",
		"Coder Home": "Accueil codeur",
		Goals: "Objectifs",
		Maintenance: "Maintenance",
		Members: "Membres",
		"Mentor Email CSV": "Emails des mentors (CSV)",
		"Mentor Home": "Accueil mentor",
		Mentors: "Mentors",
		"My Kids": "Mes enfants",
		"Parent Emails CSV": "Emails des parents (CSV)",
		"Parent Home": "Accueil parents",
		Parents: "Parents",
		"Purge Members": "Purger les membres",
		"Purge Registrations": "Purger les inscriptions",
		"Recent Belts": "Ceintures récentes",
		"Recent Belts CSV": "Ceintures récentes (CSV)",
		Reports: "Rapports",
		"Sign In Mode": "Mode d'inscription",
		Teams: "Équipes",
	},
	parents: {
		label: "Parent",
		plural: "Parents",
	},
	signIn: {
		qrPlaceholder: "Activez la caméra pour scanner un code QR.",
		sessionCount: "1 session | {count} sessions",
		signInButton: "Connexion",
		title: "Connexion à la session CoderDojo Ennis",
	},
	teams: {
		label: "Équipe",
		plural: "Équipes",
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
