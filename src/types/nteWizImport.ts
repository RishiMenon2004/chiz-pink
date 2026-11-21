// Shapes of NTEWiz data: both its exported JSON backup file (`schema_version`
// + slug-keyed maps + pre-computed `analyst` section) and a direct dump of its
// IndexedDB `"ntewiz"` object stores (arrays of rows without `analyst`).

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
	slug?: string
	owned?: boolean
	level?: number
	ascension_phase?: number
	awakening_rank?: number
	talents?: NteWizTalents
}

export type NteWizGoalState = {
	slug?: string
	level?: number
	ascension_phase?: number
	awakening_rank?: number
	talents?: NteWizTalents
}

export type NteWizWeaponState = {
	slug?: string
	owned?: boolean
	level?: number
	mixing_level?: number
}

export type NteWizWeaponGoalState = {
	slug?: string
	level?: number
	mixing_level?: number
}

export type NteWizInventoryRow = {
	slug: string
	qty: number
}

export type NteWizProfile = {
	id?: string
	server?: string
	stamina_current?: number
	stamina_max?: number
	stamina_last_seen?: string
	city_stamina_current?: number
	city_stamina_max?: number
}

export type NteWizWish = {
	id?: number
	uid?: string
	banner?: string
	item?: string
	rarity?: string
	pulled_at?: string | number
	kind?: string | null
	insert_mode?: string
	updated_at?: number
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

// Exported JSON backup file from ntewiz.xyz.
export type NteWizBackup = {
	schema_version: number
	profile?: NteWizProfile
	currencies?: Record<string, unknown>
	inventory?: Record<string, unknown>
	characters?: Record<string, NteWizCharacterState>
	goals?: Record<string, NteWizGoalState>
	weapons?: Record<string, NteWizWeaponState>
	weapon_goals?: Record<string, NteWizWeaponGoalState>
	wishes?: NteWizWish[]
	checklist?: unknown
	analyst?: {
		characters?: NteWizAnalystCharacter[]
		weapons?: NteWizAnalystWeapon[]
	}
	[key: string]: unknown
}

// Raw snapshot read straight from ntewiz.xyz's IndexedDB `"ntewiz"` database.
export type NteWizIdbDump = {
	source: "ntewiz-idb"
	profile?: NteWizProfile | NteWizProfile[]
	currencies?: Record<string, unknown> | Record<string, unknown>[]
	inventory?: NteWizInventoryRow[] | Record<string, unknown>
	characters?: NteWizCharacterState[] | Record<string, NteWizCharacterState>
	goals?: NteWizGoalState[] | Record<string, NteWizGoalState>
	weapons?: NteWizWeaponState[] | Record<string, NteWizWeaponState>
	weapon_goals?: NteWizWeaponGoalState[] | Record<string, NteWizWeaponGoalState>
	wishes?: NteWizWish[]
	checklist?: unknown[]
	[key: string]: unknown
}

export type NteWizImportData = NteWizBackup | NteWizIdbDump
