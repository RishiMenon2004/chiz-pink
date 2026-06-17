type RouteData = Record<string, { title: string, head: string, id: string}>

const routes: RouteData = {
	"/": {
		title: "DASHBOARD",
		head: "Chiz.Pink | NTE Planner and Daily/Weekly Checklist",
		id: "home"
	},

	"/checklist": {
		title: "CHECKLIST",
		head:"Daily/Weekly Checklist",
		id: "checklist"
	},

	"/characters": {
		title: "CHARACTERS",
		head:"Characters",
		id: "characters"
	},

	"/inventory": {
		title: "INVENTORY",
		head:"Inventory",
		id: "inventory"
	},

	"/settings": {
		title: "SETTINGS",
		head:"Settings",
		id: "settings"
	}
}

export default routes