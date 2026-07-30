// Shape of the JSON file exported by nteplanner.app (https://nteplanner.app/).
// Only the fields chiz-pink can actually make use of are typed here - the
// rest of the export (settings, UI state, etc.) is irrelevant to us and
// passes through as `unknown`.

export type NtePlannerSkill = {
	current: number
	target: number
}

export type NtePlannerCharacter = {
	currentLevel: number
	targetLevel: number
	currentAscension: number
	targetAscension: number
	skills: Record<string, NtePlannerSkill>
	awakeningTier?: number
}

export type NtePlannerArc = {
	currentLevel: number
	targetLevel: number
	currentAscension: number
	targetAscension: number
	characterId?: string
	characterName?: string
}

export type NtePlannerStamina = {
	pixels?: {
		amount?: number
		cap?: number
		timestamp?: number
	}
	city?: {
		current?: number
		cap?: number
		lastReset?: number
	}
}

export type NtePlannerBackup = {
	"nte:inventory"?: Record<string, number>
	"nte:stamina"?: NtePlannerStamina
	"nte:arcs"?: Record<string, NtePlannerArc>
	"nte:characters"?: Record<string, NtePlannerCharacter>
	"nte:activities"?: unknown
	"nte:events"?: unknown
	[key: string]: unknown
}
