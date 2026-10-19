// npm run content:import -- [--ref <commit>] [--from <export dir>] [--write]
//                            [--update <arc id>,<arc id>]
//
// Reads arc data straight from the game's tables and compares it with
// arcList.ts. By default the tables come from the Waifus-Grace/NTE_Assets
// repo at a pinned commit (cached in .cache/nte-assets/<commit>); --ref picks
// another commit, and --from reads a local FModel export instead (the folder
// that holds DataTable/ and Localization/).
//
// Without --write it only reports. With --write it fills in placeholder arcs
// and adds arcs the site doesn't have yet, and also regenerates the level
// stats file. Arcs that already have real data are only rewritten when named
// with --update (which implies --write); otherwise their differences are
// listed to fix by hand, since the repo is the CN client and global text or
// numbers can differ.
//
// Images aren't touched; new arcs get placeholder.webp.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { styleText } from "node:util"

import type { Arc } from "@/types/weapon"
import type { DescriptionValueType, MaterialSet } from "@/types/item"

import { EnumArcType } from "@/data/arcs/arc"
import { getAllArcsList } from "@/data/arcs/arcList"
import { EnumItemLvls, EnumRarity, EnumStatAttribute } from "@/data/items/item"
import * as materials from "@/data/items/materials"

const REPO = "Waifus-Grace/NTE_Assets"
// 1.4.13 (CN). Bump with --ref, then update this once the result checks out.
const DEFAULT_REF = "1816e237ffe9edf687dd6942d028e89cce121381"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const fromRoot = (...parts: string[]) => path.join(root, ...parts)

const args = process.argv.slice(2)
const option = (name: string) => {
	const index = args.indexOf(name)
	return index === -1 ? undefined : args[index + 1]
}
// Existing arcs to rewrite from the game anyway (e.g. after a rework).
const updateIds = new Set(option("--update")?.split(",") ?? [])
const write = args.includes("--write") || updateIds.size > 0
const exportDir = option("--from")
const ref = option("--ref") ?? DEFAULT_REF

function fail(message: string): never {
	console.error(`content:import: ${message}`)
	process.exit(1)
}

// ---------- Source files ----------

// Each file with the other paths it can have: an FModel export keeps the
// localization under Localization/Game/.
const FILES = {
	items: ["DataTable/Fork/DT_ForkItemData.json"],
	breakthrough: ["DataTable/Fork/DT_ForkBreakthroughData.json"],
	upgradeStar: ["DataTable/Fork/DT_ForkUpgradeStarDataTable.json"],
	buffCurves: ["DataTable/Fork/CT_ForkBuff.json"],
	modify: ["DataTable/PackData/ModifyData/DT_ForkModifyData.json"],
	text: ["Localization/en/game.json", "Localization/Game/en/game.json"],
} as const

async function readSource(paths: readonly string[]): Promise<unknown> {
	if (exportDir) {
		const file = paths.map((p) => path.resolve(exportDir, p)).find((p) => existsSync(p))
		if (!file) fail(`${paths[0]} isn't in ${exportDir}`)
		return JSON.parse(readFileSync(file, "utf8"))
	}

	const cached = fromRoot(".cache", "nte-assets", ref, paths[0])
	if (!existsSync(cached)) {
		const url = `https://raw.githubusercontent.com/${REPO}/${ref}/${paths[0]}`
		const response = await fetch(url)
		if (!response.ok) fail(`${url} returned ${response.status}`)
		mkdirSync(path.dirname(cached), { recursive: true })
		writeFileSync(cached, await response.text())
	}
	return JSON.parse(readFileSync(cached, "utf8"))
}

// Unreal names are case-insensitive, and the tables don't always agree on
// case (Breakthrough_pack_Fork_x vs Breakthrough_pack_fork_x).
type Table<T> = (key: string) => T | undefined

async function readTable<T>(paths: readonly string[]): Promise<[Table<T>, [string, T][]]> {
	const json = (await readSource(paths)) as Record<string, T> | { Rows: Record<string, T> }[]
	// FModel exports either the whole asset or only its rows.
	const rows = Array.isArray(json) ? json[0].Rows : json
	const byKey = new Map(Object.entries(rows).map(([key, row]) => [key.toLowerCase(), row]))
	return [(key) => byKey.get(key.toLowerCase()), Object.entries(rows)]
}

type LocalizedText = { Key: string; SourceString: string }
type ItemRow = {
	ItemName: LocalizedText
	Description: LocalizedText
	ItemQuality: string
	ElementData: {
		UpgradePackId: string
		BreakthroughPackId: string
		UpgradeStarPackID: string
		ApplyGroupType: string
		MaxUpgradeStar: number
	}
}
type ModifyRow = { ModifyData: { PropName: string; PropValue: number }[] }
type BreakthroughRow = { NeedItems: string; ModifyPackID: string }
type UpgradeStarRow = {
	Title: LocalizedText
	Description: LocalizedText
	DataList: { NameID: string; bIsPercent: boolean }[]
}
type Curve = { Keys: { Time: number; Value: number }[] }

const [[, itemRows], [breakthrough], [upgradeStar], [buffCurves], [modify], localization] =
	await Promise.all([
		readTable<ItemRow>(FILES.items),
		readTable<BreakthroughRow>(FILES.breakthrough),
		readTable<UpgradeStarRow>(FILES.upgradeStar),
		readTable<Curve>(FILES.buffCurves),
		readTable<ModifyRow>(FILES.modify),
		readSource(FILES.text) as Promise<Record<string, Record<string, string>>>,
	])

const forkText = localization.ST_Fork ?? fail("game.json has no ST_Fork table")
const english = (text: LocalizedText) => (forkText[text.Key] ?? text.SourceString).replaceAll("’", "'")

// ---------- Game values to site values ----------

const RARITIES: Record<string, EnumRarity> = {
	"EItemQuality::ITEM_QUALITY_ORANGE": EnumRarity.Epic,
	"EItemQuality::ITEM_QUALITY_PURPLE": EnumRarity.Rare,
	"EItemQuality::ITEM_QUALITY_BLUE": EnumRarity.Uncommon,
}

const ARC_TYPES: Record<string, EnumArcType> = {
	"ECharacterGroupType::CHARACTER_GROUP_TYPE_ONE": EnumArcType.Solid,
	"ECharacterGroupType::CHARACTER_GROUP_TYPE_TWO": EnumArcType.Liquid,
	"ECharacterGroupType::CHARACTER_GROUP_TYPE_THREE": EnumArcType.Plasma,
	"ECharacterGroupType::CHARACTER_GROUP_TYPE_FOUR": EnumArcType.Gas,
	"ECharacterGroupType::CHARACTER_GROUP_TYPE_FIVE": EnumArcType.Condensate,
}

const MAIN_STATS: Record<string, EnumStatAttribute> = {
	AtkUp: EnumStatAttribute.ATKBonus,
	HPMaxUp: EnumStatAttribute.HPBonus,
	DefUp: EnumStatAttribute.DEFBonus,
	CritBase: EnumStatAttribute.CritRate,
	CritDamageBase: EnumStatAttribute.CritDMG,
	UnbalIntensityBase: EnumStatAttribute.BreakIntensity,
	ChargeGetEfficiencyBase: EnumStatAttribute.ChargeEffeciency,
}

// Material families (item id without its _lvN tier) to the exports in
// items/materials.ts.
const MATERIAL_SETS: Record<string, keyof typeof materials> = {
	WeaponBreakMaterial_01: "ascAppleSeedSet",
	WeaponBreakMaterial_02: "ascMuiscSet",
	WeaponBreakMaterial_03: "ascLiquidDreamSet",
	WeaponBreakMaterial_04: "ascColdDessertSet",
	WeaponBreakMaterial_05: "ascDramaCoreSet",
	OrdinaryMonMaterial_01: "ascWhispersSet",
	OrdinaryMonMaterial_02: "ascSilhouetteSet",
	OrdinaryMonMaterial_03: "ascNumeralSet",
	OrdinaryMonMaterial_04: "ascDelusionsSet",
}

const ELEMENT_DMG = /\b(Cosmos|Anima|Incantation|Chaos|Psyche|Lakshana) DMG\b/g

// Game markup to the site's: <lv> becomes <dn>, and "<Element> DMG" outside
// a tag gets <el> so it's coloured.
function siteText(text: string) {
	return text
		.replaceAll("\r\n", "\n")
		.replaceAll("’", "'")
		.replace(/<lv>/g, "<dn>")
		.split(/(<[a-z]+[^>]*>[^<]*<\/>)/)
		.map((chunk) => (chunk.startsWith("<") ? chunk : chunk.replace(ELEMENT_DMG, "<el>$&</>")))
		.join("")
}

// Puts the game's {n} slots in the site's style: fixed whole numbers like
// durations are written into the text, slots that always hold the same
// values as an earlier one share its number, and the rest are numbered in
// the order they appear.
function normalizeSlots(description: string, values: Record<string, DescriptionValueType[]>) {
	const tiers = Object.values(values)
	const column = (slot: number) => JSON.stringify(tiers.map((tier) => tier[slot]))
	const replacement = new Map<number, string>()
	const kept: number[] = []
	const byColumn = new Map<string, string>()

	for (const [, n] of description.matchAll(/\{(\d+)\}/g)) {
		const slot = Number(n)
		if (replacement.has(slot) || tiers[0]?.[slot] === undefined) continue

		const first = tiers[0][slot]
		const constant = tiers.length > 1 && tiers.every((tier) => tier[slot].value === first.value)
		const shared = byColumn.get(column(slot))
		if (first.type === "Integer" && constant) {
			replacement.set(slot, `${first.value}`)
		} else if (shared) {
			replacement.set(slot, shared)
		} else {
			const placeholder = `{${kept.length}}`
			kept.push(slot)
			byColumn.set(column(slot), placeholder)
			replacement.set(slot, placeholder)
		}
	}

	return {
		description: description.replace(/\{(\d+)\}/g, (match, n: string) => replacement.get(Number(n)) ?? match),
		values: Object.fromEntries(
			Object.entries(values).map(([tier, list]) => [tier, kept.map((slot) => list[slot])])
		),
	}
}

// ---------- Build arcs from the tables ----------

type ImportedArc = {
	code: string
	name: string
	description: string
	rarity: EnumRarity
	type: EnumArcType
	baseAtk: number
	mainAttribute: { attribute: EnumStatAttribute; baseValue: number }
	materialSets: [string, string]
	effect: { name: string; description: string; values: Record<string, DescriptionValueType[]> }
	levelStats: { atk: number[]; mainStat: number[] }
	effectUnlinked: boolean
}

// The planner's level steps (1, 20, 20+, 30, ... 80) as game levels and
// ascension stages: each "+" step is the next stage at the same level.
const LEVEL_STEPS = Object.keys(EnumItemLvls)
	.filter((key) => isNaN(Number(key)))
	.reduce<{ level: number; stage: number }[]>((steps, key) => {
		const stage = (steps.at(-1)?.stage ?? 0) + (key.endsWith("A") ? 1 : 0)
		return [...steps, { level: Number(key.replace(/\D/g, "")), stage }]
	}, [])

const round = (value: number) => Number(value.toFixed(6))

function importArc(code: string, row: ItemRow): ImportedArc | string {
	const data = row.ElementData
	const need = <T>(value: T | undefined, what: string): T => {
		if (value === undefined) throw new Error(`${code}: no ${what}`)
		return value
	}

	try {
		const rarity = need(RARITIES[row.ItemQuality], `rarity for ${row.ItemQuality}`)
		const type = need(ARC_TYPES[data.ApplyGroupType], `arc type for ${data.ApplyGroupType}`)

		// ATK = the level curve's value plus the current stage's bonus; the
		// main stat only changes with the stage.
		const atkCurve = data.UpgradePackId.replace(/^upgrade_pack_/i, "")
		const levelAtk = (level: number) => {
			const stats = need(modify(`${atkCurve}_lv${level}`), `level ${level} stats`).ModifyData
			return need(stats.find((m) => m.PropName === "AtkBase"), `level ${level} ATK`).PropValue
		}
		const stageStats = (stage: number) => {
			const row = need(breakthrough(`${data.BreakthroughPackId}_${stage}`), `ascension stage ${stage}`)
			const stats = need(modify(row.ModifyPackID), row.ModifyPackID).ModifyData
			return {
				atk: stats.find((m) => m.PropName === "AtkBase")?.PropValue ?? 0,
				main: need(stats.find((m) => m.PropName !== "AtkBase"), `stage ${stage} main stat`),
			}
		}

		const baseAtk = levelAtk(1)
		const main = stageStats(0).main
		const attribute = need(MAIN_STATS[main.PropName], `main stat for ${main.PropName}`)
		const levelStats = {
			atk: LEVEL_STEPS.map(({ level, stage }) => levelAtk(level) + stageStats(stage).atk),
			mainStat: LEVEL_STEPS.map(({ stage }) => round(stageStats(stage).main.PropValue)),
		}

		const stage1 = need(breakthrough(`${data.BreakthroughPackId}_1`), "ascension stage 1")
		const families = stage1.NeedItems.split(",").map((item) => item.split(":")[0].replace(/_lv\d+$/, ""))
		const materialSets = families.map((family) => need(MATERIAL_SETS[family], `material set for ${family}`))
		if (materialSets.length !== 2) throw new Error(`${code}: expected 2 ascension materials, got ${families.join(", ")}`)

		const values: Record<string, DescriptionValueType[]> = {}
		let effectRow: UpgradeStarRow | undefined
		for (let tier = 1; tier <= data.MaxUpgradeStar; tier++) {
			const tierRow = need(upgradeStar(`${data.UpgradeStarPackID}_${tier}`), `tier ${tier} effect`)
			effectRow ??= tierRow
			values[tier] = tierRow.DataList.map(({ NameID, bIsPercent }) => {
				const curve = need(buffCurves(NameID), `curve ${NameID}`)
				// The curves are stepped: a tier uses the last key at or before it.
				const key = curve.Keys.findLast((k) => k.Time <= tier) ?? curve.Keys[0]
				return { type: bIsPercent ? "Percent" : "Integer", value: round(key.Value) }
			})
		}
		const effect = need(effectRow, "effect")
		// Without a DataList the game writes the tier 1 numbers into the text
		// and the real per-tier values only live in the buff, so the effect
		// can't be read from the tables.
		const effectUnlinked = Object.values(values).every((list) => list.length === 0)

		return {
			code,
			name: english(row.ItemName),
			description: english(row.Description),
			rarity,
			type,
			baseAtk,
			mainAttribute: { attribute, baseValue: round(main.PropValue) },
			materialSets: materialSets as [string, string],
			effect: {
				name: english(effect.Title),
				...normalizeSlots(siteText(english(effect.Description)), values),
			},
			levelStats,
			effectUnlinked,
		}
	} catch (error) {
		return (error as Error).message
	}
}

const imported: ImportedArc[] = []
const skipped: string[] = []
for (const [code, row] of itemRows) {
	const arc = importArc(code, row)
	if (typeof arc === "string") skipped.push(arc)
	else imported.push(arc)
}

// ---------- Compare with arcList.ts ----------

const matchKey = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, "")
const snakeCase = (value: string) =>
	value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "_")
		.replace(/^_|_$/g, "")
const siteArcs = new Map(getAllArcsList().map((arc) => [matchKey(arc.name), arc]))

const setName = (set: MaterialSet) =>
	Object.entries(materials).find(([name, value]) => name.startsWith("asc") && value === set)?.[0] ?? set[0].id

const rendered = (description: string, values: DescriptionValueType[] = []) =>
	description.replace(/\{(\d+)\}/g, (match, n: string) => {
		const value = values[Number(n)]
		if (!value) return match
		return value.type === "Percent" ? `${round(value.value * 100)}%` : `${value.value}`
	})

// Marks the words that differ: red on the site's side, green on the game's.
// styleText leaves the text plain when the output isn't a colour terminal.
function wordDiff(a: string, b: string): [string, string] {
	// The strings are JSON, so a line break is the two characters "\n".
	const words = (text: string) => text.split(/(\s+|\\n)/).filter(Boolean)
	const left = words(a)
	const right = words(b)

	// Longest common subsequence of words, filled from the end.
	const common = Array.from({ length: left.length + 1 }, () => new Uint16Array(right.length + 1))
	for (let i = left.length - 1; i >= 0; i--) {
		for (let j = right.length - 1; j >= 0; j--) {
			common[i][j] =
				left[i] === right[j] ? common[i + 1][j + 1] + 1 : Math.max(common[i + 1][j], common[i][j + 1])
		}
	}

	let siteText = ""
	let gameText = ""
	let i = 0
	let j = 0
	while (i < left.length || j < right.length) {
		if (i < left.length && j < right.length && left[i] === right[j]) {
			siteText += left[i++]
			gameText += right[j++]
		} else if (j < right.length && (i === left.length || common[i][j + 1] >= common[i + 1][j])) {
			// Whitespace-only changes (a space that became a line break) would
			// be invisible, so they're shown as a marker.
			const word = right[j++]
			gameText += styleText(["green", "bold"], word.trim() ? word : "␣")
		} else {
			const word = left[i++]
			siteText += styleText(["red", "bold"], word.trim() ? word : "␣")
		}
	}
	return [siteText, gameText]
}

function differences(arc: Arc, game: ImportedArc): string[] {
	const diffs: string[] = []
	const check = (field: string, site: unknown, value: unknown) => {
		const a = JSON.stringify(site)
		const b = JSON.stringify(value)
		if (a === b) return
		const [siteText, gameText] = wordDiff(a ?? "undefined", b ?? "undefined")
		diffs.push(`${field}: site ${siteText}\n          game ${gameText}`)
	}

	check("description", arc.description, game.description)
	check("rarity", EnumRarity[arc.rarity], EnumRarity[game.rarity])
	check("type", arc.type, game.type)
	check("baseAtk", arc.baseAtk, game.baseAtk)
	check("mainAttribute", arc.mainAttribute, game.mainAttribute)
	check("materials", [setName(arc.ascensionMaterialSet1), setName(arc.ascensionMaterialSet2)], game.materialSets)
	check("effect name", arc.effect.name, game.effect.name)

	if (game.effectUnlinked) return diffs

	// Compared as the profile shows them, so slot numbering doesn't matter.
	for (const tier of Object.keys(game.effect.values)) {
		const site = rendered(arc.effect.description, arc.effect.values[Number(tier)])
		const value = rendered(game.effect.description, game.effect.values[tier])
		if (site !== value) {
			check(`tier ${tier} effect`, site, value)
			break
		}
	}
	return diffs
}

const matching: string[] = []
const changed: [Arc, string[]][] = []
const fillable: [Arc, ImportedArc][] = []
const added: ImportedArc[] = []
const levelStats = new Map<string, ImportedArc["levelStats"]>()

for (const game of imported) {
	const arc = siteArcs.get(matchKey(game.name))
	siteArcs.delete(matchKey(game.name))
	levelStats.set(arc?.id ?? snakeCase(game.name), game.levelStats)
	if (!arc) added.push(game)
	else if (arc.isPlaceholder || updateIds.delete(arc.id)) fillable.push([arc, game])
	else {
		const diffs = differences(arc, game)
		if (diffs.length === 0) matching.push(arc.id)
		else changed.push([arc, diffs])
	}
}

// ---------- Write ----------

// Formatted the way Prettier's defaults lay out the hand-written entries:
// 80 columns with a tab counted as 2, and single quotes for strings that
// contain double quotes.
const str = (value: string) => {
	const json = JSON.stringify(value)
	return value.includes('"') && !value.includes("'")
		? `'${json.slice(1, -1).replaceAll('\\"', '"')}'`
		: json
}
const fits = (line: string) => line.replace(/^\t+/, (tabs) => "  ".repeat(tabs.length)).length <= 80
const prop = (tabs: number, key: string, value: string) => {
	const indent = "\t".repeat(tabs)
	const line = `${indent}${key}: ${value},`
	return fits(line) ? line : `${indent}${key}:\n${indent}\t${value},`
}
function arcBlock(id: string, imageSrc: string, game: ImportedArc) {
	const statName = Object.entries(EnumStatAttribute).find(([, v]) => v === game.mainAttribute.attribute)![0]
	const typeName = Object.entries(EnumArcType).find(([, v]) => v === game.type)![0]
	const values = Object.entries(game.effect.values)
		.map(([tier, list]) => {
			const items = list.map((v) => `{ type: ${str(v.type)}, value: ${v.value} }`)
			const line = `\t\t\t\t${str(tier)}: [${items.join(", ")}],`
			if (fits(line)) return line
			return `\t\t\t\t${str(tier)}: [\n${items.map((item) => `\t\t\t\t\t${item},`).join("\n")}\n\t\t\t\t],`
		})
		.join("\n")

	return `\t${id}: {
		id: ${str(id)},
		imageSrc: ${str(imageSrc)},
${prop(2, "name", str(game.name))}
${prop(2, "description", str(game.description))}
		rarity: EnumRarity.${EnumRarity[game.rarity]},
		type: EnumArcType.${typeName},
		baseAtk: ${game.baseAtk},
		mainAttribute: {
			attribute: EnumStatAttribute.${statName},
			baseValue: ${game.mainAttribute.baseValue},
		},
		ascensionMaterialSet1: ${game.materialSets[0]},
		ascensionMaterialSet2: ${game.materialSets[1]},
		effect: {
${prop(3, "name", str(game.effect.name))}
${prop(3, "description", str(game.effect.description))}
			values: {
${values}
			},
		},
	},\n`
}

const written: string[] = []

if (write && (fillable.length > 0 || added.length > 0)) {
	const file = fromRoot("src/data/arcs/arcList.ts")
	const original = readFileSync(file, "utf8")
	let arcList = original.replaceAll("\r\n", "\n")

	for (const [arc, game] of fillable) {
		const entry = new RegExp(`\\t${arc.id}: \\{\\n[\\s\\S]*?\\n\\t\\},\\n`)
		arcList = arcList.replace(entry, arcBlock(arc.id, arc.imageSrc, game))
		written.push(`arcList.ts: filled ${arc.id}`)
	}
	for (const game of added) {
		const id = snakeCase(game.name)
		const close = arcList.indexOf("\n}\n\nexport function getAllArcs")
		if (close === -1) fail("couldn't find the end of allArcs in arcList.ts")
		arcList = `${arcList.slice(0, close + 1)}\n${arcBlock(id, "placeholder.webp", game)}${arcList.slice(close + 1)}`
		written.push(`arcList.ts: added ${id} (needs public/arcs/${id}.webp)`)
	}

	// Any set the new entries use must be imported.
	const importBlock = arcList.match(/import \{\n([\s\S]*?)\n\} from "@\/data\/items\/materials"/)
	if (importBlock) {
		const imported = new Set(importBlock[1].split(",").map((s) => s.trim()).filter(Boolean))
		const needed = [...fillable.map(([, g]) => g), ...added].flatMap((g) => g.materialSets)
		for (const set of needed) imported.add(set)
		arcList = arcList.replace(
			importBlock[0],
			`import {\n${[...imported].map((s) => `\t${s},`).join("\n")}\n} from "@/data/items/materials"`
		)
	}

	writeFileSync(file, original.includes("\r\n") ? arcList.replaceAll("\n", "\r\n") : arcList)
}

// Level stats are only ever generated, so the whole file is rewritten.
const source = exportDir ? path.basename(path.resolve(exportDir)) : `${REPO}@${ref.slice(0, 7)}`
const statsFile = "src/data/arcs/arcLevelStats.ts"
const statsText = `// Generated by \`npm run content:import\` from ${source}.
// Run it again instead of editing this file.
//
// Each arc's ATK and main stat at every level step the planner offers
// (1, 20, 20+, 30, ... 80), in EnumItemLvls order.

import type { ArcLevelStats } from "@/types/weapon"

export const arcLevelStats: Record<string, ArcLevelStats> = {
${[...levelStats]
	.sort(([a], [b]) => a.localeCompare(b))
	.map(([id, stats]) => `\t${id}: {\n\t\tatk: [${stats.atk.join(", ")}],\n\t\tmainStat: [${stats.mainStat.join(", ")}],\n\t},`)
	.join("\n")}
}
`
const statsPath = fromRoot(statsFile)
const statsBefore = existsSync(statsPath) ? readFileSync(statsPath, "utf8").replaceAll("\r\n", "\n") : ""
// The header names the source, so compare only the data.
const statsData = (text: string) => text.slice(text.indexOf("import type"))
const statsOutdated = statsData(statsBefore) !== statsData(statsText)
if (write && statsOutdated) {
	writeFileSync(statsPath, statsText)
	written.push(`${statsFile} (${levelStats.size} arcs)`)
}

// ---------- Report ----------

console.log(`Read ${itemRows.length} arcs from ${source}.`)
console.log(`\nMatch the site: ${matching.length}`)

console.log(`\nDiffer from the site (not changed, fix by hand if the game is right): ${changed.length}`)
for (const [arc, diffs] of changed) {
	console.log(`\n  ${arc.name} (${arc.id})`)
	for (const diff of diffs) console.log(`    ${diff}`)
}

const unlinked = imported.filter((game) => game.effectUnlinked)
if (unlinked.length > 0) {
	console.log(`\nEffect values not in the tables (numbers are written into the text; check by hand): ${unlinked.length}`)
	for (const game of unlinked) console.log(`  - ${game.name} (${game.code})`)
}

for (const id of updateIds) console.log(`\n--update: no arc "${id}" in the game data`)

console.log(`\nPlaceholders the game has data for (and --update arcs): ${fillable.length}`)
for (const [arc] of fillable) console.log(`  - ${arc.name} (${arc.id})`)

console.log(`\nIn the game but not on the site: ${added.length}`)
for (const game of added) console.log(`  - ${game.name} (${game.code})`)

console.log(`\nOn the site but not in the game: ${siteArcs.size}`)
for (const arc of siteArcs.values()) console.log(`  - ${arc.name} (${arc.id})`)

if (skipped.length > 0) {
	console.log(`\nCouldn't read: ${skipped.length}`)
	for (const reason of skipped) console.log(`  - ${reason}`)
}

if (written.length > 0) {
	console.log(`\nWrote:`)
	for (const line of written) console.log(`  - ${line}`)
} else if (!write && (fillable.length > 0 || added.length > 0 || statsOutdated)) {
	console.log(`\nRun again with --write to fill placeholders, add new arcs and update ${statsFile}.`)
}
