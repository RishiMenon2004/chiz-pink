type Route = {
	title: string,
	head: string,
	tooltip: string,
	id: string
}
type RoutesRecord = Record<string, Route>

const routes: RoutesRecord = {
	"/": {
		title: "DASHBOARD",
		head: "Chiz.Pink | NTE Planner and Daily/Weekly Checklist",
		tooltip: "Dashboard",
		id: "home"
	},

	"/checklist": {
		title: "CHECKLIST",
		head:"Daily/Weekly Checklist",
		tooltip: "Checklist",
		id: "checklist"
	},

	"/characters": {
		title: "CHARACTERS",
		head: "Characters",
		tooltip: "Characters Planner",
		id: "characters"
	},

	"/arcs": {
		title: "ARCS",
		head: "Arcs",
		tooltip: "Arcs Planner",
		id: "arcs"
	},

	"/inventory": {
		title: "INVENTORY",
		head: "Inventory",
		tooltip: "Inventory",
		id: "inventory"
	},

	"/settings": {
		title: "SETTINGS",
		head: "Settings",
		tooltip: "Settings", 
		id: "settings"
	}
}

export default routes