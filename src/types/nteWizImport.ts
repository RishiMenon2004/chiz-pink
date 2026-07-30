// Shape of the JSON file exported by ntewiz.xyz. Only the fields chiz-pink
// can actually make use of are typed here. NTEWiz conveniently ships its own
// pre-normalized "analyst" section (current/goal level, ascension, awakening
// per character/weapon) specifically meant for third-party consumption, so
// that's used instead of hand-parsing the native characters/goals shape.

export type NteWizTalents = Partial<
	Record<
		| "basic-attack"
		| "critical-riposte"
		| "skill"
		| "ultimate"
		| "support-skill"
		| "passive"
		| "life-skill",
		number
	>
>

export type NteWizCharacterState = {
	talents?: NteWizTalents
}

export type NteWizProfile = {
	server?: string
	stamina_current?: number
	stamina_max?: number
	stamina_last_seen?: string
	city_stamina_current?: number
	city_stamina_max?: number
}

export type NteWizAnalystCharacter = {
	slug: string
	owned: boolean
	currentLevel: number
	currentAscension: number
	currentAwakening: number
	goalLevel: number | null
	goalAscension: number | null
	goalAwakening: number | null
}

export type NteWizAnalystWeapon = {
	slug: string
	owned: boolean
	currentLevel: number
	goalLevel: number | null
}

export type NteWizBackup = {
	schema_version: number
	profile?: NteWizProfile
	currencies?: Record<string, unknown>
	inventory?: Record<string, unknown>
	characters?: Record<string, NteWizCharacterState>
	goals?: Record<string, NteWizCharacterState>
	checklist?: unknown
	analyst?: {
		characters?: NteWizAnalystCharacter[]
		weapons?: NteWizAnalystWeapon[]
	}
	[key: string]: unknown
}
