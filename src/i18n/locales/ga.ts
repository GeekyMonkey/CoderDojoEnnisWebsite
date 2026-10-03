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
		Resources: "Acmhainní",
		"Sign In Mode": "Mód Sínithe Isteach",
		Teams: "Foirne",
		"This Week": "An tSeachtain Seo",
		VEX: "Róbataic VEX",
		"VEX Home": "Baile VEX",
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
	vex: {
		actions: {
			addResource: "Cuir acmhainn leis",
			addTask: "Cuir tasc leis",
			cancel: "Cealaigh",
			delete: "Bain",
			edit: "Cuir in eagar",
			editObjective: "Cuir an tseachtain seo in eagar",
			editSeason: "Cuir an séasúr in eagar",
			joinTask: "Cabhróidh mé",
			leaveTask: "Fág",
			newSeason: "Séasúr nua",
			newSprint: "Tosaigh an chéad seachtain eile",
			openWorkspace: "Oscail spás oibre na seachtaine seo",
			save: "Sábháil",
			seeAllResources: "Féach ar na hacmhainní go léir",
		},
		common: {
			loadError: "Níorbh fhéidir spás oibre VEX a lódáil: {error}",
			loading: "Ag lódáil…",
			noSeason: "Níl aon séasúr VEX socraithe fós.",
			saveError: "Níorbh fhéidir sábháil: {error}",
		},
		home: {
			currentSeason: "An séasúr reatha",
			gettingStarted: "Ag tosú",
			gettingStartedText:
				"Níl tú cinnte cá háit le tosú? Roghnaigh ábhar thíos, nó tosaigh i VEXcode VR – níl an róbat ag teastáil uait chun tosú.",
			howItWorks: {
				heading: "Conas a oibríonn sé",
				steps: {
					step1: "Socraíonn meantóir sprioc don tseachtain",
					step2: "Socraímid le chéile cad is gá a dhéanamh",
					step3: "Glacann gach duine freagracht as rud éigin",
					step4: "Oibrímid air ag an Dojo agus i rith na seachtaine",
					step5: "An Satharn dar gcionn, taispeánaimid cad a fuaireamar amach",
				},
			},
			intro: {
				p1: "Táimid ag cur foireann CoderDojo Ennis le chéile chun páirt a ghlacadh i gComórtas Róbataice VEX IQ.",
				p2: "Ní rang róbataice seachtainiúil é seo. Gach seachtain, aontaímid ar sprioc, oibrímid amach cad is gá a dhéanamh, roinnimid na jabanna, triailimid rudaí i rith na seachtaine, agus tugaimid an méid a d'fhoghlaimíomar ar ais chuig an bhfoireann an Satharn dar gcionn.",
				p3: "Uaireanta is ríomhchlárú atá i gceist. Uaireanta eile is é atá i gceist ná rialacha an chomórtais a fhoghlaim, straitéis a thástáil, cuid den róbat a dhearadh, taighde a dhéanamh ar smaoineamh, tiomáint a chleachtadh, rud éigin a scríobh, nó cabhrú le comhalta foirne atá i bhfostú.",
				p4: "Is é an aidhm ná go n-oibreoimid amach le chéile conas an dúshlán a réiteach.",
			},
			noSprint: "Níl sprioc na seachtaine seo socraithe fós.",
			previousSeasons: "Séasúir roimhe seo",
			previousWeeks: "Seachtainí roimhe seo",
			thisWeek: "An tseachtain seo",
			title: "Foireann Róbataice VEX",
		},
		resources: {
			categories: {
				competition: {
					intro: "Cad é an cluiche, na rialacha, agus conas a mheastar na foirne.",
					label: "An Comórtas",
				},
				"design-building": {
					intro: "Conas a chuirtear róbait le chéile, agus smaointe do mheicníochtaí.",
					label: "Dearadh agus Tógáil an Róbait",
				},
				"driving-strategy": {
					intro: "Cleachtadh tiomána agus smaoineamh ar conas pointí a scóráil.",
					label: "Tiomáint agus Straitéis",
				},
				programming: {
					intro: "Cód a scríobh don róbat.",
					label: "Ríomhchlárú",
				},
				"vex-iq": {
					intro: "An trealamh féin: an Brain, mótair, braiteoirí agus an rialaitheoir.",
					label: "VEX IQ",
				},
				"vexcode-vr": {
					intro: "Cleacht ríomhchlárú ar róbat fíorúil – níl aon trealamh ag teastáil.",
					label: "VEXcode VR / Virtual Skills",
				},
				"videos-references": {
					intro: "Físeáin agus rudaí úsáideacha eile le féachaint orthu.",
					label: "Físeáin / Tagairtí Úsáideacha",
				},
			},
			empty: "Níl aon rud anseo fós.",
			fields: {
				category: "Catagóir",
				description: "Cur síos gearr",
				isActive: "Taispeáin do bhaill",
				resourceType: "Cineál",
				season: "Séasúr",
				seasonGeneral: "Gach séasúr",
				sortOrder: "Ord",
				title: "Teideal",
				url: "Nasc",
			},
			form: {
				editTitle: "Cuir acmhainn in eagar",
				newTitle: "Cuir acmhainn leis",
			},
			hidden: "Folaithe",
			intro: "Ar mhaith leat obair ar VEX ach níl tú cinnte cá háit le tosú? Tá na naisc seo grúpáilte de réir ábhair, ní in aon ord ar leith. Roghnaigh cibé rud a chabhraíonn le sprioc na seachtaine seo.",
			title: "Acmhainní",
			types: {
				document: "Doiciméad",
				forum: "Fóram",
				tool: "Uirlis",
				video: "Físeán",
				website: "Suíomh gréasáin",
			},
			vr: {
				heading: "Gan róbat fós? Tosaigh i VEXcode VR",
				p1: "Is dócha nach mbeidh an trealamh VEX IQ féin againn don chéad chúpla seachtain. Níl aon fhadhb leis sin – is féidir leat tosú láithreach i do bhrabhsálaí.",
				p2: "Tá páirc chomórtais fhíorúil agus róbat fíorúil sa limistéar Level Up Virtual Skills i VEXcode VR, ionas gur féidir leat ríomhchlárú uathoibríoch a chleachtadh (cód a thiomáineann an róbat leis féin).",
				p3: "Tá Virtual Driving Skills ag VEX freisin, ach chun an róbat fíorúil a thiomáint ar an mbealach sin, teastaíonn fíor-rialaitheoir VEX IQ (2ú glúin) atá ceangailte leis an ríomhaire. Ní féidir méarchlár agus luch a úsáid ina áit.",
				p4: "B'fhéidir go mbeidh clárú VEX na foirne ag teastáil don limistéar comórtais. Má iarrann sé ort síniú isteach nó uasghrádú, iarr ar mheantóir. Beidh gach rud a fhoghlaimíonn tú úsáideach ar an bhfíor-róbat nuair a thagann sé.",
			},
		},
		season: {
			fields: {
				competitionName: "Ainm an chomórtais / an chluiche",
				description: "Cur síos",
				endDate: "Dáta deiridh",
				isCurrent: "Is é seo an séasúr reatha",
				programName: "Clár",
				seasonLabel: "Séasúr (m.sh. 2027–28)",
				slug: "Ainm gréasáin gearr (m.sh. 2027-28-game-name)",
				startDate: "Dáta tosaigh",
			},
			form: {
				editTitle: "Cuir an séasúr in eagar",
				newTitle: "Séasúr nua",
			},
			notFound: "Níorbh fhéidir an séasúr sin a aimsiú.",
			weeks: "Seachtainí",
		},
		sprint: {
			carryOver: "Gan chríochnú – é a thabhairt ar aghaidh go dtí an tseachtain seo chugainn?",
			dates: {
				review: "Athbhreithniú",
				start: "Dojo",
			},
			fields: {
				mentorNotes: "Nótaí tacaíochta (roghnach)",
				objective: "Príomhsprioc na seachtaine",
				objectivePlaceholder:
					"Cad ba cheart don fhoireann iarracht a dhéanamh a bhaint amach faoin Satharn seo chugainn?",
				reviewDate: "Dáta an athbhreithnithe",
				sprintNumber: "Uimhir na seachtaine",
				startDate: "Dáta an Dojo",
				status: "Stádas",
				statusHelp:
					"Má shocraítear seachtain mar Reatha, marcálfar an tseachtain reatha roimhe sin mar Críochnaithe.",
				title: "Teideal gearr (roghnach)",
			},
			findings: {
				empty: "Níor scríobh aon duine aon rud síos fós. Cuir nótaí le tasc chun an méid a fuair tú amach a roinnt.",
				heading: "Cad a fuaireamar amach?",
				hint: "Nótaí, naisc agus fionnachtana ó gach tasc – áisiúil don athbhreithniú Dé Sathairn.",
			},
			form: {
				editTitle: "Cuir seachtain {number} in eagar",
				newTitle: "Tosaigh seachtain nua",
			},
			mentorNotes: "Nótaí ó na meantóirí",
			noObjective: "Níl aon sprioc socraithe don tseachtain seo fós.",
			notFound: "Níorbh fhéidir an tseachtain sin a aimsiú.",
			objectiveHeading: "Ár sprioc an tseachtain seo",
			progress: "{done} as {total} déanta",
			status: {
				complete: "Críochnaithe",
				current: "Reatha",
				planned: "Pleanáilte",
			},
			tasks: {
				empty: "Níl aon tascanna fós. Cad is dóigh leat is gá a dhéanamh? Cuir an chéad cheann leis!",
				heading: "Cad is dóigh linn is gá a dhéanamh?",
				hint: "Cuir leis na jabanna ar aontaigh an fhoireann orthu agus cuir d'ainm leis na cinn a mbeidh tú ag tabhairt aire dóibh.",
			},
			weekNumber: "Seachtain {number}",
		},
		task: {
			fields: {
				link: "Nasc úsáideach (roghnach)",
				notes: "Nótaí / cad a fuaireamar amach",
				notesPlaceholder:
					"Cad a thriail tú? Cad a d'oibrigh? Cad nár oibrigh? Aon rud ar cheart don fhoireann a bheith ar an eolas faoi?",
				owners: "Cé atá ag glacadh freagrachta?",
				ownersPlaceholder: "Roghnaigh daoine",
				status: "Stádas",
				title: "Cad is gá a dhéanamh?",
			},
			form: {
				editTitle: "Cuir tasc in eagar",
				newTitle: "Cuir tasc leis",
			},
			nobody: "Aon duine fós",
			status: {
				done: "Déanta",
				in_progress: "Ar siúl",
				todo: "Le déanamh",
			},
		},
	},
} as const satisfies enMessagesType;
