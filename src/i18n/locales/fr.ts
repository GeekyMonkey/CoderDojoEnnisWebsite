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
		Resources: "Ressources",
		"Sign In Mode": "Mode d'inscription",
		Teams: "Équipes",
		"This Week": "Cette semaine",
		VEX: "Robotique VEX",
		"VEX Home": "Accueil VEX",
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
	vex: {
		actions: {
			addResource: "Ajouter une ressource",
			addTask: "Ajouter une tâche",
			cancel: "Annuler",
			delete: "Retirer",
			edit: "Modifier",
			editObjective: "Modifier cette semaine",
			editSeason: "Modifier la saison",
			joinTask: "Je vais aider",
			leaveTask: "Quitter",
			newSeason: "Nouvelle saison",
			newSprint: "Commencer la semaine suivante",
			openWorkspace: "Ouvrir l'espace de travail de la semaine",
			save: "Enregistrer",
			seeAllResources: "Voir toutes les ressources",
		},
		common: {
			loadError: "Impossible de charger l'espace VEX : {error}",
			loading: "Chargement…",
			noSeason: "Aucune saison VEX n'a encore été créée.",
			saveError: "Impossible d'enregistrer : {error}",
		},
		home: {
			currentSeason: "Saison en cours",
			gettingStarted: "Pour commencer",
			gettingStartedText:
				"Tu ne sais pas par où commencer ? Choisis un thème ci-dessous, ou commence dans VEXcode VR – pas besoin du robot pour démarrer.",
			howItWorks: {
				heading: "Comment ça marche",
				steps: {
					step1: "Un mentor fixe un objectif pour la semaine",
					step2: "On décide ensemble de ce qu'il faut faire",
					step3: "Chacun prend la responsabilité de quelque chose",
					step4: "On y travaille au Dojo et pendant la semaine",
					step5: "Le samedi suivant, on montre ce qu'on a découvert",
				},
			},
			intro: {
				p1: "Nous créons une équipe CoderDojo Ennis pour participer à la compétition de robotique VEX IQ.",
				p2: "Ce n'est pas un cours de robotique hebdomadaire. Chaque semaine, on se met d'accord sur un objectif, on voit ce qu'il faut faire, on se partage les tâches, on essaie des choses pendant la semaine, et on rapporte ce qu'on a appris à l'équipe le samedi suivant.",
				p3: "Parfois, ça veut dire programmer. Parfois, ça veut dire apprendre les règles de la compétition, tester une stratégie, concevoir une partie du robot, faire des recherches sur une idée, s'entraîner à piloter, rédiger quelque chose, ou aider un coéquipier qui est bloqué.",
				p4: "Le but, c'est de trouver ensemble comment relever le défi.",
			},
			noSprint: "L'objectif de cette semaine n'a pas encore été fixé.",
			previousSeasons: "Saisons précédentes",
			previousWeeks: "Semaines précédentes",
			thisWeek: "Cette semaine",
			title: "Équipe de robotique VEX",
		},
		resources: {
			categories: {
				competition: {
					intro: "Le jeu, les règles et comment les équipes sont évaluées.",
					label: "La compétition",
				},
				"design-building": {
					intro: "Comment on assemble un robot, et des idées de mécanismes.",
					label: "Conception et construction du robot",
				},
				"driving-strategy": {
					intro: "S'entraîner à piloter et réfléchir à comment marquer des points.",
					label: "Pilotage et stratégie",
				},
				programming: {
					intro: "Écrire du code pour le robot.",
					label: "Programmation",
				},
				"vex-iq": {
					intro: "Le kit lui-même : Brain, moteurs, capteurs et manette.",
					label: "VEX IQ",
				},
				"vexcode-vr": {
					intro: "Entraîne-toi à programmer un robot virtuel – pas besoin de kit.",
					label: "VEXcode VR / Virtual Skills",
				},
				"videos-references": {
					intro: "Des vidéos et d'autres choses utiles à regarder.",
					label: "Vidéos et références utiles",
				},
			},
			empty: "Rien ici pour l'instant.",
			fields: {
				category: "Catégorie",
				description: "Courte description",
				isActive: "Afficher aux membres",
				resourceType: "Type",
				season: "Saison",
				seasonGeneral: "Toutes les saisons",
				sortOrder: "Ordre",
				title: "Titre",
				url: "Lien",
			},
			form: {
				editTitle: "Modifier la ressource",
				newTitle: "Ajouter une ressource",
			},
			hidden: "Masqué",
			intro: "Tu veux travailler sur VEX mais tu ne sais pas par où commencer ? Ces liens sont classés par thème, sans ordre particulier. Choisis ce qui t'aide pour l'objectif de la semaine.",
			title: "Ressources",
			types: {
				document: "Document",
				forum: "Forum",
				tool: "Outil",
				video: "Vidéo",
				website: "Site web",
			},
			vr: {
				heading: "Pas encore de robot ? Commence dans VEXcode VR",
				p1: "On n'aura sans doute pas le vrai kit VEX IQ pendant les premières semaines. Pas de souci – tu peux commencer tout de suite dans ton navigateur.",
				p2: "Le terrain Level Up Virtual Skills de VEXcode VR a un terrain de compétition et un robot virtuels, pour que tu puisses t'entraîner à la programmation autonome (du code qui fait rouler le robot tout seul).",
				p3: "VEX propose aussi Virtual Driving Skills, mais pour piloter le robot virtuel de cette façon, il faut une vraie manette VEX IQ (2e génération) branchée à l'ordinateur. Un clavier et une souris ne la remplacent pas.",
				p4: "Le terrain de compétition peut demander l'inscription VEX de l'équipe. S'il te demande de te connecter ou de passer à une version payante, demande à un mentor. Tout ce que tu apprends te servira directement sur le vrai robot quand il arrivera.",
			},
		},
		season: {
			fields: {
				competitionName: "Nom de la compétition / du jeu",
				description: "Description",
				endDate: "Date de fin",
				isCurrent: "C'est la saison en cours",
				programName: "Programme",
				seasonLabel: "Saison (ex. 2027–28)",
				slug: "Nom court pour le web (ex. 2027-28-game-name)",
				startDate: "Date de début",
			},
			form: {
				editTitle: "Modifier la saison",
				newTitle: "Nouvelle saison",
			},
			notFound: "Cette saison est introuvable.",
			weeks: "Semaines",
		},
		sprint: {
			carryOver: "Pas fini – reporter à la semaine prochaine ?",
			dates: {
				review: "Bilan",
				start: "Dojo",
			},
			fields: {
				mentorNotes: "Notes d'accompagnement (facultatif)",
				objective: "Grand objectif de la semaine",
				objectivePlaceholder:
					"Qu'est-ce que l'équipe doit essayer d'atteindre d'ici samedi prochain ?",
				reviewDate: "Date du bilan",
				sprintNumber: "Numéro de semaine",
				startDate: "Date du Dojo",
				status: "Statut",
				statusHelp:
					"Passer une semaine à « En cours » marque l'ancienne semaine en cours comme « Terminée ».",
				title: "Titre court (facultatif)",
			},
			findings: {
				empty: "Personne n'a encore rien noté. Ajoute des notes à une tâche pour partager ce que tu as découvert.",
				heading: "Qu'est-ce qu'on a découvert ?",
				hint: "Notes, liens et découvertes de chaque tâche – pratique pour le bilan du samedi.",
			},
			form: {
				editTitle: "Modifier la semaine {number}",
				newTitle: "Commencer une nouvelle semaine",
			},
			mentorNotes: "Notes des mentors",
			noObjective: "Aucun objectif n'a encore été fixé pour cette semaine.",
			notFound: "Cette semaine est introuvable.",
			objectiveHeading: "Notre objectif cette semaine",
			progress: "{done} sur {total} terminées",
			status: {
				complete: "Terminée",
				current: "En cours",
				planned: "Prévue",
			},
			tasks: {
				empty: "Pas encore de tâches. D'après toi, qu'est-ce qu'il faut faire ? Ajoute la première !",
				heading: "Qu'est-ce qu'on pense devoir faire ?",
				hint: "Ajoute les tâches sur lesquelles l'équipe s'est mise d'accord et mets ton nom sur celles dont tu t'occupes.",
			},
			weekNumber: "Semaine {number}",
		},
		task: {
			fields: {
				link: "Lien utile (facultatif)",
				notes: "Notes / ce qu'on a découvert",
				notesPlaceholder:
					"Qu'est-ce que tu as essayé ? Qu'est-ce qui a marché ? Qu'est-ce qui n'a pas marché ? Quelque chose que l'équipe devrait savoir ?",
				owners: "Qui s'en occupe ?",
				ownersPlaceholder: "Choisis des personnes",
				status: "Statut",
				title: "Qu'est-ce qu'il faut faire ?",
			},
			form: {
				editTitle: "Modifier la tâche",
				newTitle: "Ajouter une tâche",
			},
			nobody: "Personne pour l'instant",
			status: {
				done: "Terminé",
				in_progress: "En cours",
				todo: "À faire",
			},
		},
	},
} as const satisfies enMessagesType;
