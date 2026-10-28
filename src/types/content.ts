// The content.json a version's intake folder holds, read by
// `npm run content:add` and written by the /content-tool dev page.

// "phase1", "phase2", "end", or a date like "2026-11-11" (that server's
// daily reset) or "2026-11-11T01:00" (UTC).
export type ContentDateRef = "phase1" | "phase2" | "end" | string

export type ContentRarity = "S" | "A" | "B"

export type ContentEventType = "Event" | "Mystery Box" | "Circle Gift"

export type ContentPatch = {
	name?: string
	phase1Start: string
	phase2Start: string
	end: string
	themeColor?: string
	yOffset?: string
}

export type ContentCharacter = {
	id: string
	name: string
	rarity?: "S" | "A"
	element?: string
	arcType?: string
	description?: string
	// Material ids. The two sets also take the set's name ("Whispers").
	materials?: {
		ascension?: string
		ascensionBoss?: string
		talent?: string
		talentBoss?: string
	}
}

export type ContentArc = {
	id: string
	name: string
	rarity?: ContentRarity
	type?: string
	description?: string
	effect?: {
		name: string
		description: string
		values?: Record<string, (string | number)[]>
	}
}

export type ContentBanner = {
	character: string
	phase: 1 | 2
	name?: string
	themeColor?: string
	yOffset?: string
	arcBanner?: { arc: string; name: string }
}

export type ContentEvent = {
	name: string
	type: ContentEventType
	start: ContentDateRef
	end: ContentDateRef
	rewards?: string[]
	themeColor?: string
	yOffset?: string
	image?: string
}

export type ContentFile = {
	version: string
	patch?: ContentPatch
	characters?: ContentCharacter[]
	arcs?: ContentArc[]
	banners?: ContentBanner[]
	events?: ContentEvent[]
	btr?: string[]
}

// ---------- /content-tool ----------

export type ContentToolOption = { id: string; name: string }

// What the content tool's dropdowns offer, read from the site's data.
export type ContentToolOptions = {
	characters: ContentToolOption[]
	arcs: ContentToolOption[]
	elements: string[]
	arcTypes: string[]
	// Set names, such as "Whispers".
	ascensionSets: string[]
	talentSets: string[]
	bossDrops: ContentToolOption[]
	weeklyBossDrops: ContentToolOption[]
	// Every material, grouped by type, for event rewards.
	rewards: (ContentToolOption & { group: string })[]
	// Version keys ("version1_5") with phase dates in patches.ts.
	versionsWithDates: string[]
}

export type ContentImageStatus = {
	// File name in the intake folder, and where content:add copies it.
	file: string
	destination: string
	label: string
	// "intake": in the version folder, copied in by content:add.
	// "public": already on the site. "missing": neither yet.
	status: "intake" | "public" | "missing"
}
