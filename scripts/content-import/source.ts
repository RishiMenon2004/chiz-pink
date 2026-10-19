// Shared by the content:import modules: command-line options, reading the
// game's tables (from the NTE_Assets repo or a local FModel export), and the
// helpers for comparing with and writing the site's data files.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { styleText } from "node:util"

import type { MaterialSet, Material } from "@/types/item"

import { EnumArcType } from "@/data/arcs/arc"
import { EnumItemLvls, EnumRarity } from "@/data/items/item"
import * as materials from "@/data/items/materials"

export const REPO = "Waifus-Grace/NTE_Assets"
// 1.4.13 (CN). Bump with --ref, then update this once the result checks out.
const DEFAULT_REF = "1816e237ffe9edf687dd6942d028e89cce121381"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")
export const fromRoot = (...parts: string[]) => path.join(root, ...parts)

const args = process.argv.slice(2)
const option = (name: string) => {
	const index = args.indexOf(name)
	return index === -1 ? undefined : args[index + 1]
}
// Existing entries to rewrite from the game anyway (e.g. after a rework).
export const updateIds = new Set(option("--update")?.split(",") ?? [])
export const write = args.includes("--write") || updateIds.size > 0
const exportDir = option("--from")
const ref = option("--ref") ?? DEFAULT_REF
export const only = option("--only")

export const sourceLabel = exportDir ? path.basename(path.resolve(exportDir)) : `${REPO}@${ref.slice(0, 7)}`

export function fail(message: string): never {
	console.error(`content:import: ${message}`)
	process.exit(1)
}

// ---------- Reading ----------

// A file's path in the repo, then any other path it has in an FModel export
// (which keeps the localization under Localization/Game/).
export async function readSource(paths: readonly string[]): Promise<unknown> {
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
export type Table<T> = ((key: string) => T | undefined) & { rows: [string, T][] }

export async function readTable<T>(paths: readonly string[]): Promise<Table<T>> {
	const json = (await readSource(paths)) as Record<string, T> | { Rows: Record<string, T> }[]
	// FModel exports either the whole asset or only its rows.
	const rows = Array.isArray(json) ? json[0].Rows : json
	const byKey = new Map(Object.entries(rows).map(([key, row]) => [key.toLowerCase(), row]))
	return Object.assign((key: string) => byKey.get(key.toLowerCase()), { rows: Object.entries(rows) })
}

export const TEXT_FILE = ["Localization/en/game.json", "Localization/Game/en/game.json"]

export type Localization = Record<string, Record<string, string>>
export type LocalizedText = { TableId?: string; Key: string; SourceString: string }

export type ModifyRow = { ModifyData: { PropName: string; PropValue: number }[] }

// Looks a key up in any string table (character text is spread over many).
export function textLookup(localization: Localization) {
	const byKey = new Map<string, string>()
	for (const table of Object.values(localization)) {
		for (const [key, value] of Object.entries(table)) if (!byKey.has(key)) byKey.set(key, value)
	}
	return (key: string) => byKey.get(key)?.replaceAll("’", "'")
}

// ---------- Game values to site values ----------

export const RARITIES: Record<string, EnumRarity> = {
	"EItemQuality::ITEM_QUALITY_ORANGE": EnumRarity.Epic,
	"EItemQuality::ITEM_QUALITY_PURPLE": EnumRarity.Rare,
	"EItemQuality::ITEM_QUALITY_BLUE": EnumRarity.Uncommon,
}

export const ARC_TYPES: Record<string, EnumArcType> = {
	"ECharacterGroupType::CHARACTER_GROUP_TYPE_ONE": EnumArcType.Solid,
	"ECharacterGroupType::CHARACTER_GROUP_TYPE_TWO": EnumArcType.Liquid,
	"ECharacterGroupType::CHARACTER_GROUP_TYPE_THREE": EnumArcType.Plasma,
	"ECharacterGroupType::CHARACTER_GROUP_TYPE_FOUR": EnumArcType.Gas,
	"ECharacterGroupType::CHARACTER_GROUP_TYPE_FIVE": EnumArcType.Condensate,
}

// Material families (item id without its _lvN tier) to the id of the site
// material, or of the first material of the site's set.
const MATERIAL_IDS: Record<string, string> = {
	// Arc ascension
	WeaponBreakMaterial_01: "iron_apple_seed",
	WeaponBreakMaterial_02: "beaty",
	WeaponBreakMaterial_03: "liquid_dream_trial_kit",
	WeaponBreakMaterial_04: "flavorless_cold_dessert",
	WeaponBreakMaterial_05: "beginner_drama_core",
	// Arc and character ascension
	OrdinaryMonMaterial_01: "lost_whispers",
	OrdinaryMonMaterial_02: "fading_silhouette",
	OrdinaryMonMaterial_03: "blurred_numeral",
	OrdinaryMonMaterial_04: "suspended_delusions",
	// Character ascension bosses
	Worldboss_material_01: "confessional_flower_seed",
	Worldboss_material_02: "charging_knight_spark_plug",
	Worldboss_material_03: "a_page_from_delusions_shore",
	Worldboss_material_04: "water_moon_pick",
	Worldboss_material_05: "nest_guard_fragment",
	Worldboss_material_06: "colorful_ticket_stub",
	Worldboss_material_07: "tear_of_the_sea",
	// Character talents
	SkillUpMaterial_01: "nestlings_longing",
	SkillUpMaterial_02: "fng",
	SkillUpMaterial_03: "first_expectations",
	SkillUpMaterial_04: "synchronicity_of_thought",
	SkillUpMaterial_05: "hesitation_of_the_waves",
	// Weekly bosses
	weeklycloneboss_a01_01: "good_boy_stamp",
	weeklycloneboss_a02_01: "dress_sleeves_of_vanity",
	weeklycloneboss_a03_01: "eternal_memory",
}

export const materialFamily = (itemId: string) => itemId.replace(/_lv\d+$/, "")

const isSet = (value: unknown): value is MaterialSet => Array.isArray(value) && value.length === 3

// The materials.ts export for a family: its set when the site has one,
// otherwise the single material.
export function materialExport(family: string): string | undefined {
	const id = MATERIAL_IDS[family]
	if (!id) return undefined
	const entries = Object.entries(materials)
	return (
		entries.find(([, value]) => isSet(value) && value[0].id === id)?.[0] ??
		entries.find(([, value]) => !isSet(value) && (value as Material).id === id)?.[0]
	)
}

// The export name the site uses for a set or material object.
export const exportNameOf = (value: MaterialSet | Material) =>
	Object.entries(materials).find(([, v]) => v === value)?.[0] ?? (isSet(value) ? value[0].id : value.id)

// ---------- Levels ----------

// The planner's level steps (1, 20, 20+, 30, ... 80) as game levels and
// ascension stages: each "+" step is the next stage at the same level.
export const LEVEL_STEPS = Object.keys(EnumItemLvls)
	.filter((key) => isNaN(Number(key)))
	.reduce<{ level: number; stage: number }[]>((steps, key) => {
		const stage = (steps.at(-1)?.stage ?? 0) + (key.endsWith("A") ? 1 : 0)
		return [...steps, { level: Number(key.replace(/\D/g, "")), stage }]
	}, [])

export const round = (value: number) => Number(value.toFixed(6))

// ---------- Matching and comparing ----------

export const matchKey = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, "")
export const snakeCase = (value: string) =>
	value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "_")
		.replace(/^_|_$/g, "")

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

// Collects "field: site … / game …" lines for the values that differ.
export function differenceList() {
	const diffs: string[] = []
	const check = (field: string, site: unknown, game: unknown) => {
		const a = JSON.stringify(site)
		const b = JSON.stringify(game)
		if (a === b) return
		const [siteText, gameText] = wordDiff(a ?? "undefined", b ?? "undefined")
		diffs.push(`${field}: site ${siteText}\n          game ${gameText}`)
	}
	return { diffs, check }
}

// ---------- Writing ----------

// Formatted the way Prettier's defaults lay out the hand-written entries:
// 80 columns with a tab counted as 2, and single quotes for strings that
// contain double quotes.
export const str = (value: string) => {
	const json = JSON.stringify(value)
	return value.includes('"') && !value.includes("'")
		? `'${json.slice(1, -1).replaceAll('\\"', '"')}'`
		: json
}
export const fits = (line: string) => line.replace(/^\t+/, (tabs) => "  ".repeat(tabs.length)).length <= 80
export const prop = (tabs: number, key: string, value: string) => {
	const indent = "\t".repeat(tabs)
	const line = `${indent}${key}: ${value},`
	return fits(line) ? line : `${indent}${key}:\n${indent}\t${value},`
}

// Rewrites a fully generated data file when its data changed (the header
// names the source, so it isn't compared). Returns whether it was stale.
export function writeGenerated(file: string, description: string, body: string): boolean {
	const text = `// Generated by \`npm run content:import\` from ${sourceLabel}.
// Run it again instead of editing this file.
//
${description
	.split("\n")
	.map((line) => `// ${line}`.trimEnd())
	.join("\n")}

${body}`
	const fullPath = fromRoot(file)
	const before = existsSync(fullPath) ? readFileSync(fullPath, "utf8").replaceAll("\r\n", "\n") : ""
	const data = (value: string) => value.slice(value.indexOf("\n\n"))
	const stale = data(before) !== data(text)
	if (write && stale) writeFileSync(fullPath, text)
	return stale
}

// Edits work on "\n"; the file keeps the line endings it had.
export function editFile(file: string, edit: (text: string) => string) {
	const fullPath = fromRoot(file)
	const original = readFileSync(fullPath, "utf8")
	const edited = edit(original.replaceAll("\r\n", "\n"))
	writeFileSync(fullPath, original.includes("\r\n") ? edited.replaceAll("\n", "\r\n") : edited)
}

export function printList<T>(title: string, items: T[], line: (item: T) => string) {
	console.log(`\n${title}: ${items.length}`)
	for (const item of items) console.log(`  - ${line(item)}`)
}
