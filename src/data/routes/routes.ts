// Static routes. Their text (page title, <title>, tooltip and meta
// description) lives in src/messages under routes.<id>. `hasDescription`
// marks the ones with their own description; the rest use the site tagline.
type Route = {
	id: string
	hasDescription?: boolean
}

export const RoutesData = {
	"/": { id: "home" },
	"/checklist": { id: "checklist", hasDescription: true },
	"/characters": { id: "character_list", hasDescription: true },
	"/characters/[id]": { id: "character_info" },
	"/arcs": { id: "arc_list", hasDescription: true },
	"/arcs/[id]": { id: "arc_info" },
	"/planner": { id: "planner", hasDescription: true },
	"/planner/arcs": { id: "arcs", hasDescription: true },
	"/planner/characters": { id: "characters", hasDescription: true },
	"/pulls": { id: "pulls", hasDescription: true },
	"/inventory": { id: "inventory", hasDescription: true },
	"/settings": { id: "settings" },
	"/privacy": { id: "privacy_policy", hasDescription: true },
	"/migrate": { id: "migrate" },
	"/pulls/import-external": { id: "import_external" },
	"/content-tool": { id: "content_tool" },
	"/auth/popup-callback": { id: "popup-callback" },
} as const satisfies Record<string, Route>

export type RoutePath = keyof typeof RoutesData
