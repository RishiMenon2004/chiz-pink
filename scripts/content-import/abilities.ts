// Ability names and descriptions, laid out the way the game's skill screen
// shows them. DT_GameplayAbilityTipsData lists each ability's sections in
// order (a title and a text key each), and DT_CharacterAbilityCityGroupConfig
// gives each life skill one text key per level. Both point at the exact
// string table, so Zero's current kit (Female051_SkillDes) is never confused
// with the old one still in Female_SkillDes.

import type { Ability, CharacterAbilitySet } from "@/types/character"

import { type Localization, fits, prop, str } from "./source"

type TextRef = { TableId?: string; Key?: string }
type ConfigAbility = {
	Key: string
	Value: {
		AbilityIndex: number
		LevelsCostItems: { Level: number; CostItems: { ID: string }[] }[]
	}
}
export type AbilityConfig = {
	CharacterAbilityList: ConfigAbility[]
	PassiveAbilityList: ConfigAbility[]
	CityList: ConfigAbility[]
}
export type TipsRow = {
	Name: TextRef
	AbilityDescription?: { DescriptionTitle?: TextRef; Description?: TextRef }[]
}
export type CityGroupRow = {
	AbilityName: TextRef
	AbilityCityAttributeArray?: { AttributeLevel: number; Description: TextRef }[]
}

export type Slot = keyof CharacterAbilitySet
export type ImportedAbilities = Partial<Record<Slot, Ability>>

// The site's slot order.
export const SLOTS: Slot[] = [
	"basicAttack",
	"skill",
	"ultimate",
	"support",
	"passive1",
	"passive2",
	"passive3",
	"lifeSkill1",
	"lifeSkill2",
]

// The proactive abilities by AbilityIndex.
const PROACTIVE: Record<number, Slot> = {
	1: "basicAttack",
	2: "skill",
	3: "ultimate",
	4: "support",
}

// Names the site writes its own way, by character id.
const SITE_NAMES: Record<string, Partial<Record<Slot, string>>> = {
	zankou: { skill: "Sanguine Dash / Soulcross" },
}

// Typos in the game's English, fixed wherever they appear.
const TEXT_FIXES: [string, string][] = [["entire team' ATK", "entire team's ATK"]]

const ELEMENT_TAGS = /<(Ling|Xiang|Guang|Hun|Zhou|An)>/g
const ELEMENT_DMG = /\b(Cosmos|Anima|Incantation|Chaos|Psyche|Lakshana) DMG\b/g
// Bare numbers, but not ones inside names ("3.8-Billion-Year", "ETD-4").
const NUMBER = /(?<![\w{.-])\d+(?:,\d{3})*(?:\.\d+)?(?:%|st|nd|rd|th)?(?![\w.,-]*\d|-\w)/g

// Game markup to the site's. The site's parser takes lowercase tags with no
// nesting, tags every number (the game only some) and doesn't highlight
// glossary terms.
export function siteMarkup(text: string) {
	const fixed = TEXT_FIXES.reduce((t, [from, to]) => t.replaceAll(from, to), text)
	return fixed
		.replaceAll("\r\n", "\n")
		.replaceAll("’", "'")
		.replace(/<TextHLT>([^<]*)<\/>(:?)/g, "<sh>$1$2</>")
		.replace(/<(NumGreen|Green2?|lv)>/g, "<dn>")
		.replace(ELEMENT_TAGS, "<el>")
		// Anything else (glossary links, Title, Italic, colours) is dropped,
		// its text kept.
		.replace(/<(?!\/>|dn>|el>|sh>)[^>]*>([^<]*)<\/>/g, "$1")
		.split(/(<[a-z]+>[^<]*<\/>)/)
		.map((chunk) =>
			chunk.startsWith("<") ? chunk : chunk.replace(NUMBER, "<dn>$&</>").replace(ELEMENT_DMG, "<el>$&</>")
		)
		.join("")
		// Units go after the number: "<dn>0.5</>s", not "<dn>0.5s</>".
		.replace(/<dn>([\d.,]+)s<\/>/g, "<dn>$1</>s")
		.trim()
}

// Reads a text by its exact string table ("/Game/Text/…/Akane_SkillDes.Akane_SkillDes").
export function textByRef(localization: Localization) {
	const tables = new Map(
		Object.entries(localization).map(([name, entries]) => [
			name.toLowerCase(),
			new Map(Object.entries(entries).map(([key, value]) => [key.toLowerCase(), value])),
		])
	)
	return (ref?: TextRef) => {
		const table = ref?.TableId?.split(".").pop()?.toLowerCase()
		return table && ref?.Key ? tables.get(table)?.get(ref.Key.toLowerCase()) : undefined
	}
}

const plain = (text: string) => text.replace(/<[^>]*>/g, "").replaceAll("’", "'").trim()

// Ability names carry their kind: "Ultimate: Crimson Fury".
const abilityName = (text: string) =>
	plain(text).replace(/^(Basic Attack|Redirect Skill|Ultimate|Critical Riposte|Support Skill): /, "")

// Levels are numbered from 0 (passives and life skills, which cost an
// unlock) or 1 (combat abilities, which start unlocked).
const maxLevel = (ability: ConfigAbility) => (ability.Value.LevelsCostItems.at(-1)?.Level ?? 0) + 1

export function abilityReader(
	tips: (key: string) => TipsRow | undefined,
	cityGroups: (key: string) => CityGroupRow | undefined,
	localization: Localization
) {
	const text = textByRef(localization)

	// A combat ability or passive: one section per description entry, except
	// the italic flavour quotes (keys ending in "_background"). Titles only
	// when there's more than one section, as on the site.
	function combat(ability: ConfigAbility, problems: string[]): Ability | undefined {
		const row = tips(ability.Key)
		const name = row && text(row.Name)
		if (!row || !name) {
			problems.push(`no skill screen entry for ${ability.Key}`)
			return undefined
		}
		const entries = (row.AbilityDescription ?? []).flatMap((entry) => {
			const body = text(entry.Description)
			if (/_background$/i.test(entry.Description?.Key ?? "") || !body?.trim()) return []
			const title = text(entry.DescriptionTitle)
			return [{ title: title && plain(title), description: siteMarkup(body) }]
		})
		return {
			name: abilityName(name),
			description: entries.map(({ title, description }) =>
				entries.length > 1 && title ? { section: title, description } : { description }
			),
			maxLvl: maxLevel(ability),
		}
	}

	// A life skill: one "<sh>Level N:</>" section per level.
	function lifeSkill(ability: ConfigAbility, problems: string[]): Ability | undefined {
		const row = cityGroups(ability.Key)
		const name = row && text(row.AbilityName)
		if (!row || !name) {
			problems.push(`no life skill entry for ${ability.Key}`)
			return undefined
		}
		const levels = [...(row.AbilityCityAttributeArray ?? [])].sort((a, b) => a.AttributeLevel - b.AttributeLevel)
		return {
			name: plain(name),
			description: levels.map((level) => ({
				description: `<sh>Level ${level.AttributeLevel}:</> ${siteMarkup(text(level.Description) ?? "")}`,
			})),
			maxLvl: maxLevel(ability),
		}
	}

	return (config: AbilityConfig, problems: string[]) => {
		const abilities: ImportedAbilities = {}
		for (const ability of config.CharacterAbilityList) {
			const slot = PROACTIVE[ability.Value.AbilityIndex]
			if (slot) abilities[slot] = combat(ability, problems)
		}
		for (const ability of config.PassiveAbilityList) {
			abilities[`passive${ability.Value.AbilityIndex}` as Slot] = combat(ability, problems)
		}
		for (const ability of config.CityList) {
			abilities[`lifeSkill${ability.Value.AbilityIndex}` as Slot] = lifeSkill(ability, problems)
		}
		return abilities
	}
}

// The abilities with the names the site writes its own way.
export function withSiteNames(id: string, abilities: ImportedAbilities): ImportedAbilities {
	const names = SITE_NAMES[id] ?? {}
	return Object.fromEntries(
		Object.entries(abilities).map(([slot, ability]) => [
			slot,
			ability && names[slot as Slot] ? { ...ability, name: names[slot as Slot]! } : ability,
		])
	)
}

// The character file's "abilities" property, formatted like the hand-written
// ones (80 columns, a tab counted as 4).
export function abilitiesBlock(abilities: ImportedAbilities) {
	const lines = ["\tabilities: {"]
	for (const slot of SLOTS) {
		const ability = abilities[slot]
		if (!ability) continue
		lines.push(`\t\t${slot}: {`, prop(3, "name", str(ability.name), 4))
		const [only] = ability.description
		const oneLine = `\t\t\tdescription: [{ description: ${str(only?.description ?? "")} }],`
		if (ability.description.length === 1 && !only.section && fits(oneLine, 4)) {
			lines.push(oneLine)
		} else {
			lines.push("\t\t\tdescription: [")
			for (const section of ability.description) {
				lines.push("\t\t\t\t{")
				if (section.section) lines.push(prop(5, "section", str(section.section), 4))
				lines.push(prop(5, "description", str(section.description), 4), "\t\t\t\t},")
			}
			lines.push("\t\t\t],")
		}
		lines.push(`\t\t\tmaxLvl: ${ability.maxLvl},`, "\t\t},")
	}
	lines.push("\t},")
	return lines.join("\n")
}
