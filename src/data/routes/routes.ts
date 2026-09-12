type Route = {
	title: string
	head: string
	tooltip: string
	id: string
}

type RoutesRecord = Record<string, Route>

export const RoutesData: RoutesRecord = {
	"/": {
		title: "DASHBOARD",
		head: "Chiz.Pink | NTE Planner and Daily/Weekly Checklist",
		tooltip: "Dashboard",
		id: "home",
	},

	"/checklist": {
		title: "CHECKLIST",
		head: "Daily/Weekly Checklist",
		tooltip: "Checklist",
		id: "checklist",
	},

	"/characters/[id]": {
		title: "CHARACTER PROFILE",
		head: "Character Profile",
		tooltip: "Character Profile",
		id: "character_info",
	},

	"/arcs/[id]": {
		title: "ARC INDEX",
		head: "Arc Index",
		tooltip: "Arc Index",
		id: "arc_info",
	},

	"/planner": {
		title: "PLANNER",
		head: "Ascension Planner",
		tooltip: "Ascension Planner",
		id: "planner",
	},

	"/planner/arcs": {
		title: "ARC PLANNER",
		head: "Arc Planner",
		tooltip: "Arc Planner",
		id: "arcs",
	},

	"/planner/characters": {
		title: "CHARACTER PLANNER",
		head: "Character Planner",
		tooltip: "Character Planner",
		id: "characters",
	},

	"/pulls": {
		title: "PULL TRACKER",
		head: "Pull Tracker",
		tooltip: "Pull Tracker",
		id: "pulls",
	},

	"/inventory": {
		title: "INVENTORY",
		head: "Inventory",
		tooltip: "Inventory",
		id: "inventory",
	},

	"/settings": {
		title: "SETTINGS",
		head: "Settings",
		tooltip: "Settings",
		id: "settings",
	},

	"/privacy": {
		title: "PRIVACY POLICY",
		head: "Privacy Policy",
		tooltip: "Privacy Policy",
		id: "privacy_policy",
	},

	"/auth/popup-callback": {
		title: "Account Linked",
		head: "",
		tooltip: "",
		id: "popup-callback",
	},
}
