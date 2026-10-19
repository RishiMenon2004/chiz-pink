// Characters: reads each playable character's stats, element, arc type and
// materials from the character tables, compares them with the character
// files, and regenerates characterLevelStats.ts.
//
// Ability names are compared too. Ability descriptions aren't: nothing in
// the tables links an ability to its text, and each character has several
// versions of every text.

import type { Character, CharacterAbilitySet } from "@/types/character"

import { EnumCharacterElement } from "@/data/characters/character"
import { getAllCharactersList } from "@/data/characters/characterList"
import { EnumRarity } from "@/data/items/item"

import {
	ARC_TYPES,
	differenceList,
	exportNameOf,
	LEVEL_STEPS,
	type LocalizedText,
	type Localization,
	matchKey,
	materialExport,
	materialFamily,
	type ModifyRow,
	printList,
	RARITIES,
	readSource,
	readTable,
	sourceLabel,
	TEXT_FILE,
	textLookup,
	write,
	writeGenerated,
} from "./source"

type CharacterRow = {
	ItemName: LocalizedText
	ItemQuality: string
	ElementData: {
		PropModifyID: string
		CharacterElementType: string
		CharacterGroupType: string
		UpgradeModifyPackId: string
		BreakthroughPackId: string
	}
}
type BreakthroughRow = { NeedItems: string; ModifyPackID: string }
type BaseStats = { HPMaxBase: number; AtkBase: number; DefBase: number }
type Ability = {
	Key: string
	Value: {
		AbilityIndex: number
		LevelsCostItems: { CostItems: { ID: string }[] }[]
	}
}
type AbilityConfig = {
	CharacterAbilityList: Ability[]
	PassiveAbilityList: Ability[]
	CityList: Ability[]
}

const ELEMENTS: Record<string, EnumCharacterElement> = {
	"ECharacterElementType::CHARACTER_ELEMENT_TYPE_COSMOS": EnumCharacterElement.COSMOS,
	"ECharacterElementType::CHARACTER_ELEMENT_TYPE_NATURE": EnumCharacterElement.ANIMA,
	"ECharacterElementType::CHARACTER_ELEMENT_TYPE_INCANTATION": EnumCharacterElement.INCANTATION,
	"ECharacterElementType::CHARACTER_ELEMENT_TYPE_CHAOS": EnumCharacterElement.CHAOS,
	"ECharacterElementType::CHARACTER_ELEMENT_TYPE_PSYCHE": EnumCharacterElement.PSYCHE,
	"ECharacterElementType::CHARACTER_ELEMENT_TYPE_LAKSHANA": EnumCharacterElement.LAKSHANA,
}

// Game names that differ from the site's, to the site's character id.
export const SITE_IDS: Record<string, string> = {
	Zero: "zero",
}

// The proactive abilities by AbilityIndex.
const PROACTIVE: Record<number, keyof CharacterAbilitySet> = {
	1: "basicAttack",
	2: "skill",
	3: "ultimate",
	4: "support",
}

// Ability text keys don't always match the ability's key: "UltraSkill" is
// sometimes spelled "UtraSkill", "Passive_1" sometimes "Passive1", and some
// keys carry the character's number ("GA_Mint019_Melee" -> "GA_Mint_Melee").
function nameKeys(key: string) {
	const variants = new Set([key])
	for (const variant of [...variants]) variants.add(variant.replace(/^(GA_[A-Za-z]+)\d+_/, "$1_"))
	for (const variant of [...variants]) {
		variants.add(variant.replace("UltraSkill", "UtraSkill"))
		variants.add(variant.replace(/Passive_?(\d)/, "Passive$1"))
		variants.add(variant.replace(/Passive_?(\d)/, "Passive_$1"))
	}
	return [...variants].map((variant) => `${variant}_name`)
}

type ImportedCharacter = {
	code: string
	name: string
	rarity: EnumRarity
	element: EnumCharacterElement
	arcType: string
	materials: {
		ascensionMaterialSet?: string
		ascensionBossMaterial?: string
		talentMaterialSet?: string
		talentBossMaterial?: string
	}
	abilityNames: Partial<Record<keyof CharacterAbilitySet, string>>
	levelStats: { hp: number[]; atk: number[]; def: number[] }
}

export async function importCharacters() {
	const [characters, abilities, breakthrough, baseStats, modify, localization] = await Promise.all([
		readTable<CharacterRow>(["DataTable/Character/DT_Character.json"]),
		readTable<AbilityConfig>(["DataTable/Character/DT_CharacterAbilityConfig.json"]),
		readTable<BreakthroughRow>(["DataTable/Character/DT_CharacterBreakthroughDataTable.json"]),
		readTable<BaseStats>(["DataTable/PackData/DT_PlayerPackData.json"]),
		readTable<ModifyRow>(["DataTable/PackData/ModifyData/DT_PlayerModifyPackData.json"]),
		readSource(TEXT_FILE) as Promise<Localization>,
	])
	const text = textLookup(localization)

	// Ability text lives in "<Name>_SkillDes" tables, and some keys appear in
	// more than one (Zero's two versions), so the table named after the key's
	// prefix is tried first. Keys and table names vary in case.
	const tables = new Map(
		Object.entries(localization).map(([table, entries]) => [
			table.toLowerCase(),
			new Map(Object.entries(entries).map(([k, v]) => [k.toLowerCase(), v])),
		])
	)
	const anyTable = textLookup(Object.fromEntries([...tables].map(([t, m]) => [t, Object.fromEntries(m)])))
	const abilityName = (key: string) => {
		const prefix = key.match(/^GA_([A-Za-z]+)(\d*)_/)
		const preferred = prefix
			? [`${prefix[1]}${prefix[2]}_skilldes`, `${prefix[1]}_skilldes`].map((t) => tables.get(t.toLowerCase()))
			: []
		const keys = nameKeys(key).map((k) => k.toLowerCase())
		const name =
			preferred.flatMap((table) => keys.map((k) => table?.get(k))).find(Boolean) ??
			keys.map((k) => anyTable(k)).find(Boolean)
		// Some names carry their tag and kind: "<Title>Ultimate: Crimson Fury</>".
		return name
			?.replace(/<[^>]*>/g, "")
			.replace(/^(Basic Attack|Redirect Skill|Ultimate|Critical Riposte|Support Skill): /, "")
			.replaceAll("’", "'")
	}

	function importCharacter(code: string, row: CharacterRow): ImportedCharacter | string {
		const data = row.ElementData
		const need = <T>(value: T | undefined, what: string): T => {
			if (value === undefined) throw new Error(`${code}: no ${what}`)
			return value
		}

		try {
			const name = need(text(row.ItemName.Key), `name (${row.ItemName.Key})`)
			const statsOf = (pack: string | undefined) => {
				const stats = (pack && modify(pack)?.ModifyData) || []
				const value = (prop: string) => stats.find((m) => m.PropName === prop)?.PropValue ?? 0
				return { hp: value("HPMaxBase"), atk: value("AtkBase"), def: value("DefBase") }
			}
			const base = need(baseStats(data.PropModifyID), `base stats ${data.PropModifyID}`)
			const stage = (n: number) => breakthrough(`${data.BreakthroughPackId}_${n}`)
			need(stage(6), "ascension stages")
			const at = (level: number, stageNumber: number) => {
				const lv = statsOf(`${data.UpgradeModifyPackId}_${level}`)
				const st = statsOf(stage(stageNumber)?.ModifyPackID)
				return {
					hp: Math.round(base.HPMaxBase + lv.hp + st.hp),
					atk: Math.round(base.AtkBase + lv.atk + st.atk),
					def: Math.round(base.DefBase + lv.def + st.def),
				}
			}
			const steps = LEVEL_STEPS.map(({ level, stage }) => at(level, stage))

			// Ascension needs a material set and (from stage 2) a boss drop;
			// skill upgrades need a talent set and a weekly boss drop.
			const ascension = [0, 1, 2, 3, 4, 5, 6].flatMap((n) =>
				(stage(n)?.NeedItems ?? "").split(",").filter(Boolean).map((item) => materialFamily(item.split(":")[0]))
			)
			const config = abilities(code)
			const skillCosts = [...(config?.CharacterAbilityList ?? []), ...(config?.PassiveAbilityList ?? [])].flatMap(
				(ability) => ability.Value.LevelsCostItems.flatMap((level) => level.CostItems.map((item) => materialFamily(item.ID)))
			)
			const first = (families: string[], pattern: RegExp) => {
				const family = families.find((f) => pattern.test(f))
				return family && (materialExport(family) ?? `unknown ${family}`)
			}

			const abilityNames: ImportedCharacter["abilityNames"] = {}
			for (const ability of config?.CharacterAbilityList ?? []) {
				const slot = PROACTIVE[ability.Value.AbilityIndex]
				if (slot) abilityNames[slot] = abilityName(ability.Key)
			}
			for (const ability of config?.PassiveAbilityList ?? []) {
				abilityNames[`passive${ability.Value.AbilityIndex}` as keyof CharacterAbilitySet] = abilityName(ability.Key)
			}
			for (const ability of config?.CityList ?? []) {
				abilityNames[`lifeSkill${ability.Value.AbilityIndex}` as keyof CharacterAbilitySet] = abilityName(ability.Key)
			}

			return {
				code,
				name,
				rarity: need(RARITIES[row.ItemQuality], `rarity for ${row.ItemQuality}`),
				element: need(ELEMENTS[data.CharacterElementType], `element for ${data.CharacterElementType}`),
				arcType: need(ARC_TYPES[data.CharacterGroupType], `arc type for ${data.CharacterGroupType}`),
				materials: {
					ascensionMaterialSet: first(ascension, /^OrdinaryMonMaterial/),
					ascensionBossMaterial: first(ascension, /^Worldboss_material/),
					talentMaterialSet: first(skillCosts, /^SkillUpMaterial/),
					talentBossMaterial: first(skillCosts, /^weeklycloneboss/),
				},
				abilityNames,
				levelStats: {
					hp: steps.map((s) => s.hp),
					atk: steps.map((s) => s.atk),
					def: steps.map((s) => s.def),
				},
			}
		} catch (error) {
			return (error as Error).message
		}
	}

	// ---------- Compare with the character files ----------

	const siteCharacters = new Map(getAllCharactersList().map((c) => [matchKey(c.name), c]))
	const siteById = new Map(getAllCharactersList().map((c) => [c.id, c]))
	const matching: string[] = []
	const changed: [Character, string[]][] = []
	const placeholders: [Character, ImportedCharacter][] = []
	const added: ImportedCharacter[] = []
	const skipped: string[] = []
	const levelStats = new Map<string, ImportedCharacter["levelStats"]>()
	const seen = new Set<string>()

	for (const [code, row] of characters.rows) {
		const game = importCharacter(code, row)
		if (typeof game === "string") {
			skipped.push(game)
			continue
		}
		// Alternate rows of one character (Zero's other gender, story
		// versions) share its name; the first row is the playable one.
		if (seen.has(game.name)) continue
		seen.add(game.name)

		const character = siteById.get(SITE_IDS[game.name]) ?? siteCharacters.get(matchKey(game.name))
		if (!character) {
			added.push(game)
			continue
		}
		siteCharacters.delete(matchKey(character.name))
		levelStats.set(character.id, game.levelStats)
		if (character.isPlaceholder) {
			placeholders.push([character, game])
			continue
		}

		const { diffs, check } = differenceList()
		check("rarity", EnumRarity[character.rarity], EnumRarity[game.rarity])
		check("element", character.element, game.element)
		check("arcType", character.arcType, game.arcType)
		for (const [field, value] of Object.entries(game.materials)) {
			check(field, exportNameOf(character[field as keyof typeof game.materials]), value)
		}
		for (const [slot, name] of Object.entries(game.abilityNames)) {
			const ability = character.abilities[slot as keyof CharacterAbilitySet]
			if (name) check(`${slot} name`, ability?.name, name)
		}
		if (diffs.length === 0) matching.push(character.id)
		else changed.push([character, diffs])
	}

	// ---------- Write ----------

	const statsFile = "src/data/characters/characterLevelStats.ts"
	const statsOutdated = writeGenerated(
		statsFile,
		"Each character's base HP, ATK and DEF at every level step the planner\noffers (1, 20, 20+, 30, ... 80), in EnumItemLvls order.",
		`import type { CharacterLevelStats } from "@/types/character"

export const characterLevelStats: Record<string, CharacterLevelStats> = {
${[...levelStats]
	.sort(([a], [b]) => a.localeCompare(b))
	.map(
		([id, stats]) =>
			`\t${id}: {\n\t\thp: [${stats.hp.join(", ")}],\n\t\tatk: [${stats.atk.join(", ")}],\n\t\tdef: [${stats.def.join(", ")}],\n\t},`
	)
	.join("\n")}
}
`
	)

	// ---------- Report ----------

	console.log(`\n========== Characters ==========`)
	console.log(`Read ${characters.rows.length} character rows from ${sourceLabel}.`)
	console.log(`\nMatch the site: ${matching.length}`)

	console.log(`\nDiffer from the site (not changed, fix by hand if the game is right): ${changed.length}`)
	for (const [character, diffs] of changed) {
		console.log(`\n  ${character.name} (${character.id})`)
		for (const diff of diffs) console.log(`    ${diff}`)
	}

	printList("Placeholders the game has data for", placeholders, ([c, g]) => `${c.name} (${c.id}, game ${g.code})`)
	printList("In the game but not on the site", added, (game) => `${game.name} (${game.code})`)
	printList("On the site but not in the game", [...siteCharacters.values()], (c) => `${c.name} (${c.id})`)
	if (skipped.length > 0) printList("Couldn't read", skipped, (reason) => reason)

	if (write && statsOutdated) {
		printList("Wrote", [`${statsFile} (${levelStats.size} characters)`], (line) => line)
	} else if (!write && statsOutdated) {
		console.log(`\nRun again with --write to update ${statsFile}.`)
	}
}
