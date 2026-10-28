type Route = {
	title: string
	// Page <title>, before the " | Chiz.Pink" suffix (the home page has none).
	head: string
	// Meta description: what search results show under the title.
	description?: string
	tooltip: string
	id: string
}

type RoutesRecord = Record<string, Route>

export const RoutesData: RoutesRecord = {
	"/": {
		title: "DASHBOARD",
		head: "Chiz.Pink: Neverness to Everness (NTE) Planner & Pull Tracker",
		// No description: uses the site tagline (SITE_DESCRIPTION).
		tooltip: "Dashboard",
		id: "home",
	},

	"/checklist": {
		title: "CHECKLIST",
		head: "NTE Daily & Weekly Checklist",
		description:
			"A Neverness to Everness checklist for daily and weekly tasks that resets on your server's schedule, plus your own custom tasks.",
		tooltip: "Checklist",
		id: "checklist",
	},

	"/characters": {
		title: "CHARACTERS",
		head: "Neverness to Everness Characters",
		description:
			"Every Neverness to Everness Esper with their element, arc type, abilities, passive skills and ascension materials.",
		tooltip: "Characters",
		id: "character_list",
	},

	"/characters/[id]": {
		title: "CHARACTER PROFILE",
		head: "Character Profile",
		tooltip: "Character Profile",
		id: "character_info",
	},

	"/arcs": {
		title: "ARCS",
		head: "Neverness to Everness Arcs",
		description:
			"Every Neverness to Everness arc with its effects, stats and ascension materials.",
		tooltip: "Arcs",
		id: "arc_list",
	},

	"/arcs/[id]": {
		title: "ARC INDEX",
		head: "Arc Index",
		tooltip: "Arc Index",
		id: "arc_info",
	},

	"/planner": {
		title: "PLANNER",
		head: "NTE Ascension Planner",
		description:
			"Work out every material you need to level and ascend your Espers and arcs in Neverness to Everness, checked against your inventory.",
		tooltip: "Ascension Planner",
		id: "planner",
	},

	"/planner/arcs": {
		title: "ARC PLANNER",
		head: "NTE Arc Ascension Planner",
		description:
			"Plan arc levels and ascensions in Neverness to Everness and see exactly which materials you still need to farm.",
		tooltip: "Arc Planner",
		id: "arcs",
	},

	"/planner/characters": {
		title: "CHARACTER PLANNER",
		head: "NTE Character Ascension Planner",
		description:
			"Plan Esper levels, ascensions and talents in Neverness to Everness and see exactly which materials you still need to farm.",
		tooltip: "Character Planner",
		id: "characters",
	},

	"/pulls": {
		title: "PULL TRACKER",
		head: "NTE Pull & Pity Tracker",
		description:
			"Track your Neverness to Everness pulls and pity on every banner, or import your pull history to see your rate-up wins and losses.",
		tooltip: "Pull Tracker",
		id: "pulls",
	},

	"/inventory": {
		title: "INVENTORY",
		head: "NTE Material Inventory",
		description:
			"Keep count of your Neverness to Everness materials so the ascension planner knows what you still need to farm.",
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
		description:
			"What Chiz.Pink stores and where: everything stays in your browser unless you turn on Google sync, which is end-to-end encrypted.",
		tooltip: "Privacy Policy",
		id: "privacy_policy",
	},

	"/migrate": {
		title: "MOVING",
		head: "Moving to chiz.pink",
		tooltip: "Moving to chiz.pink",
		id: "migrate",
	},

	"/content-tool": {
		title: "CONTENT TOOL",
		head: "Content tool",
		tooltip: "Content tool",
		id: "content_tool",
	},

	"/auth/popup-callback": {
		title: "Account Linked",
		head: "",
		tooltip: "",
		id: "popup-callback",
	},
}
