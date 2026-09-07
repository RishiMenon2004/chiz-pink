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

	"/characters": {
		title: "CHARACTERS",
		head: "Characters",
		tooltip: "Characters Planner",
		id: "characters",
	},

	"/characters/[id]": {
		title: "CHARACTER PROFILE",
		head: "Character Profile",
		tooltip: "Character Profile",
		id: "character_info",
	},

	"/arcs": {
		title: "ARCS",
		head: "Arcs",
		tooltip: "Arcs Planner",
		id: "arcs",
	},

	"/arcs/[id]": {
		title: "ARC INFO",
		head: "Arc Info",
		tooltip: "Arc Info",
		id: "arc_info",
	},

	"/planner": {
		title: "PLANNER",
		head: "Ascension Planner",
		tooltip: "Ascension Planner",
		id: "planner",
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
