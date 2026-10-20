// Characters: reads each playable character's stats, element, arc type,
// materials and abilities from the character tables, compares them with the
// character files, and regenerates characterLevelStats.ts.
//
// With --write it fills placeholder characters (abilities, materials,
// rarity, element, arc type) and drops their placeholder flag; their
// one-line description stays hand-written. --update <id> rewrites an
// existing character's abilities. Abilities come from content-import/abilities.ts.

import { existsSync } from "node:fs"

import type { Character } from "@/types/character"

import { EnumArcType } from "@/data/arcs/arc"
import { EnumCharacterElement } from "@/data/characters/character"
import { getAllCharactersList } from "@/data/characters/characterList"
import { EnumRarity } from "@/data/items/item"

import {
	abilitiesBlock,
	type AbilityConfig,
	abilityReader,
	type CityGroupRow,
	type ImportedAbilities,
	SLOTS,
	type TipsRow,
	withSiteNames,
} from "./abilities"
import {
	ARC_TYPES,
	differenceList,
	editFile,
	exportNameOf,
	fits,
	fromRoot,
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
	updateIds,
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

const MATERIAL_FIELDS = [
	"ascensionMaterialSet",
	"ascensionBossMaterial",
	"talentMaterialSet",
	"talentBossMaterial",
] as const

type ImportedCharacter = {
	code: string
	name: string
	rarity: EnumRarity
	element: EnumCharacterElement
	arcType: EnumArcType
	materials: Partial<Record<(typeof MATERIAL_FIELDS)[number], string>>
	abilities: ImportedAbilities
	problems: string[]
	levelStats: { hp: number[]; atk: number[]; def: number[] }
}

export async function importCharacters() {
	const [characters, abilities, breakthrough, baseStats, modify, tips, cityGroups, localization] =
		await Promise.all([
			readTable<CharacterRow>(["DataTable/Character/DT_Character.json"]),
			readTable<AbilityConfig>(["DataTable/Character/DT_CharacterAbilityConfig.json"]),
			readTable<BreakthroughRow>(["DataTable/Character/DT_CharacterBreakthroughDataTable.json"]),
			readTable<BaseStats>(["DataTable/PackData/DT_PlayerPackData.json"]),
			readTable<ModifyRow>(["DataTable/PackData/ModifyData/DT_PlayerModifyPackData.json"]),
			readTable<TipsRow>(["DataTable/Skill/DT_GameplayAbilityTipsData.json"]),
			readTable<CityGroupRow>(["DataTable/Character/DT_CharacterAbilityCityGroupConfig.json"]),
			readSource(TEXT_FILE) as Promise<Localization>,
		])
	const text = textLookup(localization)
	const readAbilities = abilityReader(tips, cityGroups, localization)

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
			const skillCosts = [...(config?.CharacterAbilityList ?? []), ...(config?.PassiveAbilityList ?? [])].flatMap((ability) =>
				ability.Value.LevelsCostItems.flatMap((level) => level.CostItems.map((item) => materialFamily(item.ID)))
			)
			const first = (families: string[], pattern: RegExp) => {
				const family = families.find((f) => pattern.test(f))
				return family && (materialExport(family) ?? `unknown ${family}`)
			}
			const problems: string[] = config ? [] : ["no ability config"]

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
				abilities: config ? readAbilities(config, problems) : {},
				problems,
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
	const updates: [Character, ImportedCharacter][] = []
	const added: ImportedCharacter[] = []
	const skipped: string[] = []
	const levelStats = new Map<string, ImportedCharacter["levelStats"]>()
	const seen = new Set<string>()

	for (const [code, row] of characters.rows) {
		const imported = importCharacter(code, row)
		if (typeof imported === "string") {
			skipped.push(imported)
			continue
		}
		// Alternate rows of one character (Zero's other gender, story
		// versions) share its name; the first row is the playable one.
		if (seen.has(imported.name)) continue
		seen.add(imported.name)

		const character = siteById.get(SITE_IDS[imported.name]) ?? siteCharacters.get(matchKey(imported.name))
		if (!character) {
			added.push(imported)
			continue
		}
		const game = { ...imported, abilities: withSiteNames(character.id, imported.abilities) }
		siteCharacters.delete(matchKey(character.name))
		levelStats.set(character.id, game.levelStats)
		if (character.isPlaceholder) {
			placeholders.push([character, game])
			continue
		}
		if (updateIds.delete(character.id)) updates.push([character, game])

		const { diffs, check } = differenceList()
		check("rarity", EnumRarity[character.rarity], EnumRarity[game.rarity])
		check("element", character.element, game.element)
		check("arcType", character.arcType, game.arcType)
		for (const field of MATERIAL_FIELDS) check(field, exportNameOf(character[field]), game.materials[field])

		// Abilities, section by section.
		for (const slot of SLOTS) {
			const site = character.abilities[slot]
			const fromGame = game.abilities[slot]
			if (!site && !fromGame) continue
			check(`${slot} name`, site?.name, fromGame?.name)
			check(`${slot} maxLvl`, site?.maxLvl, fromGame?.maxLvl)
			const sections = Math.max(site?.description.length ?? 0, fromGame?.description.length ?? 0)
			for (let i = 0; i < sections; i++) {
				const a = site?.description[i]
				const b = fromGame?.description[i]
				check(`${slot} ${i + 1} title`, a?.section, b?.section)
				check(`${slot} ${i + 1}`, a?.description, b?.description)
			}
		}
		for (const problem of game.problems) diffs.push(problem)
		if (diffs.length === 0) matching.push(character.id)
		else changed.push([character, diffs])
	}

	// ---------- Write ----------

	const written: string[] = []
	const unwritten: string[] = []
	const characterFile = (id: string) => `src/data/characters/${id}.ts`

	// The abilities are the last property of every character file.
	const replaceAbilities = (text: string, abilities: ImportedAbilities) => {
		const start = text.indexOf("\n\tabilities:")
		const end = text.lastIndexOf("\n}")
		if (start === -1 || end < start) throw new Error("couldn't find the abilities")
		return `${text.slice(0, start + 1)}${abilitiesBlock(abilities)}${text.slice(end)}`
	}

	const edit = (character: Character, what: string, change: (text: string) => string) => {
		const file = characterFile(character.id)
		if (!existsSync(fromRoot(file))) return unwritten.push(`${character.name}: no ${file}`)
		try {
			editFile(file, change)
			written.push(`${file}: ${what}`)
		} catch (error) {
			unwritten.push(`${character.name}: ${(error as Error).message}`)
		}
	}

	if (write) {
		for (const [character, game] of updates) {
			edit(character, "abilities", (text) => replaceAbilities(text, game.abilities))
		}

		for (const [character, game] of placeholders) {
			const materials = MATERIAL_FIELDS.map((field) => game.materials[field])
			if (materials.some((m) => !m || m.startsWith("unknown"))) {
				unwritten.push(`${character.name}: a material isn't on the site yet (${materials.join(", ")})`)
				continue
			}
			const enumKey = (values: object, value: unknown) => Object.entries(values).find(([, v]) => v === value)?.[0]
			edit(character, "filled from the game (write its description by hand)", (text) => {
				let file = replaceAbilities(text, game.abilities)
					.replace("\tisPlaceholder: true,\n", "")
					.replace(/import \{ placeholderAbilities \} from "\.\/placeholder"\n/, "")
					.replace(/\trarity: EnumRarity\.\w+,/, `\trarity: EnumRarity.${EnumRarity[game.rarity]},`)
					.replace(
						/\telement: EnumCharacterElement\.\w+,/,
						`\telement: EnumCharacterElement.${enumKey(EnumCharacterElement, game.element)},`
					)
					.replace(/\tarcType: EnumArcType\.\w+,/, `\tarcType: EnumArcType.${enumKey(EnumArcType, game.arcType)},`)
				MATERIAL_FIELDS.forEach((field, i) => {
					file = file.replace(new RegExp(`\\t${field}: \\w+,`), `\t${field}: ${materials[i]},`)
				})
				// The materials import lists exactly the four the file uses.
				return file.replace(/import \{[^}]*\} from ("[^"]*items\/materials")/, (_, from: string) => {
					const names = [...new Set(materials as string[])].sort((a, b) => a.localeCompare(b))
					const line = `import { ${names.join(", ")} } from ${from}`
					return fits(line, 4) ? line : `import {\n${names.map((n) => `\t${n},`).join("\n")}\n} from ${from}`
				})
			})
		}
	}

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
	if (write && statsOutdated) written.push(`${statsFile} (${levelStats.size} characters)`)

	// ---------- Report ----------

	console.log(`\n========== Characters ==========`)
	console.log(`Read ${characters.rows.length} character rows from ${sourceLabel}.`)
	console.log(`\nMatch the site: ${matching.length}`)

	console.log(`\nDiffer from the site (fix by hand, or --update <id> to take the game's abilities): ${changed.length}`)
	for (const [character, diffs] of changed) {
		console.log(`\n  ${character.name} (${character.id})`)
		for (const diff of diffs) console.log(`    ${diff}`)
	}

	printList("Placeholders the game has data for", placeholders, ([c, g]) => `${c.name} (${c.id}, game ${g.code})`)
	printList("In the game but not on the site", added, (game) => `${game.name} (${game.code})`)
	printList("On the site but not in the game", [...siteCharacters.values()], (c) => `${c.name} (${c.id})`)
	if (skipped.length > 0) printList("Couldn't read", skipped, (reason) => reason)

	if (written.length > 0) printList("Wrote", written, (line) => line)
	if (unwritten.length > 0) printList("Couldn't write", unwritten, (line) => line)
	if (!write && (placeholders.length > 0 || statsOutdated)) {
		console.log(`\nRun again with --write to fill placeholders and update ${statsFile}.`)
	}
}
