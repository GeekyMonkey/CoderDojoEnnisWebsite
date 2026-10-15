import type { BroadenLiterals } from "#shared/utils/TypeHelpers";

/**
 * English translations
 * Used as the base for other locales
 */
export default {
	attendance: {
		columns: {
			name: "Name",
			photo: "Photo",
			present: "Present",
		},
		footer: {
			chooseRandomCoder: "Choose Random Coder",
		},
		include: {
			allMembers: "All",
			label: "Include",
			presentMembers: "Present",
			registeredMembers: "Registered",
		},
		noMembersSignedIn: "No members signed in",
		sessionDate: "Session Date",
	},
	belts: {
		description: "Belt Description",
		label: "Belt",
		plural: "Belts",
	},
	beltApplications: {
		applicationDate: "Applied",
		applicationNotes: "Notes from applicant",
		empty: "There are no pending belt applications.",
		heading: "Belt Applications",
	},
	coders: {
		label: "Coder",
		plural: "Coders",
	},
	labels: {
		search: "Search",
	},
	language: {
		current: "Current language: {Language}",
		description: "Select your preferred language",
		select: "Select language",
	},
	login: {
		loginButton: "Login",
		password: "Password",
		title: "CoderDojo Ennis Member Login",
		username: "Username",
	},
	memberBelt: {
		color: {
			black: "Black",
			blue: "Blue",
			green: "Green",
			red: "Red",
			white: "White",
			yellow: "Yellow",
		},
		label: "{Color}",
		noob: "Noob",
	},
	mentors: {
		label: "Mentor",
		plural: "Mentors",
	},
	nav: {
		Attendance: "Attendance",
		"Badge Categories": "Badge Categories",
		Badges: "Badges",
		"Badges Available": "Badges Available",
		Belts: "Belts",
		"Coder Home": "Coder Home",
		Goals: "Goals",
		Maintenance: "Maintenance",
		Members: "Members",
		"Mentor Email CSV": "Mentor Email CSV",
		"Mentor Home": "Mentor Home",
		Mentors: "Mentors",
		"My Kids": "My Kids",
		"Parent Emails CSV": "Parent Emails CSV",
		"Parent Home": "Parent Home",
		Parents: "Parents",
		"Purge Members": "Purge Members",
		"Purge Registrations": "Purge Registrations",
		"Recent Belts": "Recent Belts",
		"Recent Belts CSV": "Recent Belts CSV",
		Reports: "Reports",
		Resources: "Resources",
		"Sign In Mode": "Sign In Mode",
		Teams: "Teams",
		"This Week": "This Week",
		VEX: "VEX Robotics",
		"VEX Home": "VEX Home",
	},
	parents: {
		label: "Parent",
		plural: "Parents",
	},
	signIn: {
		qrPlaceholder: "Enable the camera to scan a QR code.",
		sessionCount: "1 session | {count} sessions",
		signInButton: "Sign In",
		title: "CoderDojo Ennis Session Sign In",
	},
	teams: {
		label: "Team",
		plural: "Teams",
	},
	theme: {
		author: "Created by {AuthorName}",
		description: "Choose your preferred theme",
		select: "Select Theme",
	},
	userMenu: {
		language: "Language",
		logOut: "Log out",
		profile: "Profile",
		theme: "Theme",
	},
	validation: {
		minLength: "Must be at least {min} characters",
	},
	vex: {
		actions: {
			addResource: "Add resource",
			addTask: "Add a task",
			cancel: "Cancel",
			delete: "Remove",
			edit: "Edit",
			editObjective: "Edit this week",
			editSeason: "Edit season",
			joinTask: "I'll help",
			leaveTask: "Leave",
			newSeason: "New season",
			newSprint: "Start next week",
			openWorkspace: "Open this week's workspace",
			save: "Save",
			seeAllResources: "See all resources",
		},
		common: {
			loadError: "Couldn't load the VEX workspace: {error}",
			loading: "Loading…",
			noSeason: "No VEX season has been set up yet.",
			saveError: "Couldn't save: {error}",
		},
		home: {
			currentSeason: "Current season",
			gettingStarted: "Getting started",
			gettingStartedText:
				"Not sure where to begin? Pick a topic below, or start in VEXcode VR – you don't need the robot to begin.",
			howItWorks: {
				heading: "How it works",
				steps: {
					step1: "A mentor sets a goal for the week",
					step2: "We decide together what needs doing",
					step3: "Everyone takes responsibility for something",
					step4: "Work on it at the Dojo and during the week",
					step5: "Next Saturday we show what we found out",
				},
			},
			intro: {
				p1: "We're building an Ennis CoderDojo team to take part in the VEX IQ Robotics Competition.",
				p2: "This isn't a weekly robotics class. Each week we agree on a goal, work out what needs doing, share out the jobs, try things out during the week, and bring what we've learned back to the team the following Saturday.",
				p3: "Sometimes that means programming. Sometimes it means learning the competition rules, testing a strategy, designing part of the robot, researching an idea, practising driving, writing something up, or helping a teammate get unstuck.",
				p4: "The aim is for us to work out how to solve the challenge together.",
			},
			noSprint: "This week's goal hasn't been set yet.",
			previousSeasons: "Previous seasons",
			previousWeeks: "Previous weeks",
			thisWeek: "This week",
			title: "VEX Robotics Team",
		},
		resources: {
			categories: {
				competition: {
					intro: "What the game is, the rules, and how teams are judged.",
					label: "The Competition",
				},
				"design-building": {
					intro: "How robots go together, and ideas for mechanisms.",
					label: "Robot Design & Building",
				},
				"driving-strategy": {
					intro: "Driving practice and thinking about how to score.",
					label: "Driving & Strategy",
				},
				programming: {
					intro: "Writing code for the robot.",
					label: "Programming",
				},
				"vex-iq": {
					intro: "The kit itself: Brain, motors, sensors and controller.",
					label: "VEX IQ",
				},
				"vexcode-vr": {
					intro: "Practise programming a virtual robot – no kit needed.",
					label: "VEXcode VR / Virtual Skills",
				},
				"videos-references": {
					intro: "Videos and other useful things to look at.",
					label: "Useful Videos / References",
				},
			},
			empty: "Nothing here yet.",
			fields: {
				category: "Category",
				description: "Short description",
				isActive: "Show to members",
				resourceType: "Type",
				season: "Season",
				seasonGeneral: "All seasons",
				sortOrder: "Order",
				title: "Title",
				url: "Link",
			},
			form: {
				editTitle: "Edit resource",
				newTitle: "Add a resource",
			},
			hidden: "Hidden",
			intro: "Want to work on VEX but not sure where to start? These links are grouped by topic, not in any order. Pick whatever helps with this week's goal.",
			title: "Resources",
			types: {
				document: "Document",
				forum: "Forum",
				tool: "Tool",
				video: "Video",
				website: "Website",
			},
			vr: {
				heading: "No robot yet? Start in VEXcode VR",
				p1: "We probably won't have the physical VEX IQ kit for the first few weeks. That's fine – you can start straight away in your browser.",
				p2: "The Level Up Virtual Skills playground in VEXcode VR has a virtual competition field and robot, so you can practise autonomous programming (code that drives the robot by itself).",
				p3: "VEX also has Virtual Driving Skills, but driving the virtual robot that way needs a real VEX IQ (2nd generation) Controller plugged into the computer. A keyboard and mouse isn't a replacement for it.",
				p4: "The competition playground may need the team's VEX registration. If it asks you to sign in or upgrade, ask a mentor. Everything you learn carries straight over to the real robot when it arrives.",
			},
		},
		season: {
			fields: {
				competitionName: "Competition / game name",
				description: "Description",
				endDate: "End date",
				isCurrent: "This is the current season",
				programName: "Programme",
				seasonLabel: "Season (e.g. 2027–28)",
				slug: "Short web name (e.g. 2027-28-game-name)",
				startDate: "Start date",
			},
			form: {
				editTitle: "Edit season",
				newTitle: "New season",
			},
			notFound: "That season couldn't be found.",
			weeks: "Weeks",
		},
		sprint: {
			carryOver: "Not finished – carry into next week?",
			dates: {
				review: "Review",
				start: "Dojo",
			},
			fields: {
				mentorNotes: "Supporting notes (optional)",
				objective: "Macro objective for the week",
				objectivePlaceholder:
					"What should the team try to achieve by next Saturday?",
				reviewDate: "Review date",
				sprintNumber: "Week number",
				startDate: "Dojo date",
				status: "Status",
				statusHelp:
					"Setting a week to Current marks the previous current week as Complete.",
				title: "Short title (optional)",
			},
			findings: {
				empty: "Nobody has written anything down yet. Add notes to a task to share what you found.",
				heading: "What did we find out?",
				hint: "Notes, links and discoveries from each task – handy for the Saturday review.",
			},
			form: {
				editTitle: "Edit week {number}",
				newTitle: "Start a new week",
			},
			mentorNotes: "Notes from the mentors",
			noObjective: "No objective has been set for this week yet.",
			notFound: "That week couldn't be found.",
			objectiveHeading: "Our objective this week",
			progress: "{done} of {total} done",
			status: {
				complete: "Complete",
				current: "Current",
				planned: "Planned",
			},
			tasks: {
				empty: "No tasks yet. What do you think needs doing? Add the first one!",
				heading: "What do we think we need to do?",
				hint: "Add the jobs the team agreed on and put your name on the ones you'll look after.",
			},
			weekNumber: "Week {number}",
		},
		task: {
			fields: {
				link: "Useful link (optional)",
				notes: "Notes / what we found out",
				notesPlaceholder:
					"What did you try? What worked? What didn't? Anything the team should know?",
				owners: "Who's taking responsibility?",
				ownersPlaceholder: "Choose people",
				status: "Status",
				title: "What needs doing?",
			},
			form: {
				editTitle: "Edit task",
				newTitle: "Add a task",
			},
			nobody: "Nobody yet",
			status: {
				done: "Done",
				in_progress: "In progress",
				todo: "To do",
			},
		},
	},
} as const;

/**
 * Type used for validation in other locale files for completeness
 */
export type defaultType = ReturnType<() => typeof import("./en").default>;
export type enMessagesType = BroadenLiterals<defaultType>;
