// Arcs: builds every arc from the Fork tables, compares it with arcList.ts,
// fills placeholders and adds new arcs with --write, and regenerates
// arcLevelStats.ts.

import type { Arc } from "@/types/weapon"
import type { DescriptionValueType } from "@/types/item"

import { EnumArcType } from "@/data/arcs/arc"
import { getAllArcsList } from "@/data/arcs/arcList"
import { EnumRarity, EnumStatAttribute } from "@/data/items/item"

import {
	ARC_TYPES,
	differenceList,
	editFile,
	exportNameOf,
	fail,
	fits,
	LEVEL_STEPS,
	type LocalizedText,
	matchKey,
	materialExport,
	materialFamily,
	type ModifyRow,
	printList,
	prop,
	RARITIES,
	readSource,
	readTable,
	round,
	snakeCase,
	sourceLabel,
	str,
	TEXT_FILE,
	type Localization,
	updateIds,
	write,
	writeGenerated,
} from "./source"

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
type BreakthroughRow = { NeedItems: string; ModifyPackID: string }
type UpgradeStarRow = {
	Title: LocalizedText
	Description: LocalizedText
	DataList: { NameID: string; bIsPercent: boolean }[]
}
type Curve = { Keys: { Time: number; Value: number }[] }

const MAIN_STATS: Record<string, EnumStatAttribute> = {
	AtkUp: EnumStatAttribute.ATKBonus,
	HPMaxUp: EnumStatAttribute.HPBonus,
	DefUp: EnumStatAttribute.DEFBonus,
	CritBase: EnumStatAttribute.CritRate,
	CritDamageBase: EnumStatAttribute.CritDMG,
	UnbalIntensityBase: EnumStatAttribute.BreakIntensity,
	ChargeGetEfficiencyBase: EnumStatAttribute.ChargeEffeciency,
}

const ELEMENT_DMG = /\b(Cosmos|Anima|Incantation|Chaos|Psyche|Lakshana) DMG\b/g

// Game markup to the site's: <lv> becomes <dn>, and "<Element> DMG" outside
// a tag gets <el> so it's coloured.
function siteText(text: string) {
	return text
		.replaceAll("\r\n", "\n")
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
	// Without a DataList the game writes the tier 1 numbers into the text and
	// the real per-tier values only live in the buff, so the effect can't be
	// read from the tables.
	effectUnlinked: boolean
}

const rendered = (description: string, values: DescriptionValueType[] = []) =>
	description.replace(/\{(\d+)\}/g, (match, n: string) => {
		const value = values[Number(n)]
		if (!value) return match
		return value.type === "Percent" ? `${round(value.value * 100)}%` : `${value.value}`
	})

function differences(arc: Arc, game: ImportedArc): string[] {
	const { diffs, check } = differenceList()

	check("description", arc.description, game.description)
	check("rarity", EnumRarity[arc.rarity], EnumRarity[game.rarity])
	check("type", arc.type, game.type)
	check("baseAtk", arc.baseAtk, game.baseAtk)
	check("mainAttribute", arc.mainAttribute, game.mainAttribute)
	check(
		"materials",
		[exportNameOf(arc.ascensionMaterialSet1), exportNameOf(arc.ascensionMaterialSet2)],
		game.materialSets
	)
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

export async function importArcs() {
	const [items, breakthrough, upgradeStar, buffCurves, modify, localization] = await Promise.all([
		readTable<ItemRow>(["DataTable/Fork/DT_ForkItemData.json"]),
		readTable<BreakthroughRow>(["DataTable/Fork/DT_ForkBreakthroughData.json"]),
		readTable<UpgradeStarRow>(["DataTable/Fork/DT_ForkUpgradeStarDataTable.json"]),
		readTable<Curve>(["DataTable/Fork/CT_ForkBuff.json"]),
		readTable<ModifyRow>(["DataTable/PackData/ModifyData/DT_ForkModifyData.json"]),
		readSource(TEXT_FILE) as Promise<Localization>,
	])

	const forkText = localization.ST_Fork ?? fail("game.json has no ST_Fork table")
	const english = (text: LocalizedText) => (forkText[text.Key] ?? text.SourceString).replaceAll("’", "'")

	function importArc(code: string, row: ItemRow): ImportedArc | string {
		const data = row.ElementData
		const need = <T>(value: T | undefined, what: string): T => {
			if (value === undefined) throw new Error(`${code}: no ${what}`)
			return value
		}

		try {
			const rarity = need(RARITIES[row.ItemQuality], `rarity for ${row.ItemQuality}`)
			const type = need(ARC_TYPES[data.ApplyGroupType], `arc type for ${data.ApplyGroupType}`)

			// ATK = the level curve's value plus the current stage's bonus;
			// the main stat only changes with the stage.
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

			const main = stageStats(0).main
			const attribute = need(MAIN_STATS[main.PropName], `main stat for ${main.PropName}`)

			const stage1 = need(breakthrough(`${data.BreakthroughPackId}_1`), "ascension stage 1")
			const families = stage1.NeedItems.split(",").map((item) => materialFamily(item.split(":")[0]))
			const materialSets = families.map((family) => need(materialExport(family), `material set for ${family}`))
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

			return {
				code,
				name: english(row.ItemName),
				description: english(row.Description),
				rarity,
				type,
				baseAtk: levelAtk(1),
				mainAttribute: { attribute, baseValue: round(main.PropValue) },
				materialSets: materialSets as [string, string],
				effect: {
					name: english(effect.Title),
					...normalizeSlots(siteText(english(effect.Description)), values),
				},
				levelStats: {
					atk: LEVEL_STEPS.map(({ level, stage }) => levelAtk(level) + stageStats(stage).atk),
					mainStat: LEVEL_STEPS.map(({ stage }) => round(stageStats(stage).main.PropValue)),
				},
				effectUnlinked: Object.values(values).every((list) => list.length === 0),
			}
		} catch (error) {
			return (error as Error).message
		}
	}

	const imported: ImportedArc[] = []
	const skipped: string[] = []
	for (const [code, row] of items.rows) {
		const arc = importArc(code, row)
		if (typeof arc === "string") skipped.push(arc)
		else imported.push(arc)
	}

	// ---------- Compare with arcList.ts ----------

	const siteArcs = new Map(getAllArcsList().map((arc) => [matchKey(arc.name), arc]))
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

	const written: string[] = []

	if (write && (fillable.length > 0 || added.length > 0)) {
		editFile("src/data/arcs/arcList.ts", (text) => {
			let arcList = text
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
				const names = new Set(importBlock[1].split(",").map((s) => s.trim()).filter(Boolean))
				for (const game of [...fillable.map(([, g]) => g), ...added]) {
					for (const set of game.materialSets) names.add(set)
				}
				arcList = arcList.replace(
					importBlock[0],
					`import {\n${[...names].map((s) => `\t${s},`).join("\n")}\n} from "@/data/items/materials"`
				)
			}
			return arcList
		})
	}

	const statsFile = "src/data/arcs/arcLevelStats.ts"
	const statsOutdated = writeGenerated(
		statsFile,
		"Each arc's ATK and main stat at every level step the planner offers\n(1, 20, 20+, 30, ... 80), in EnumItemLvls order.",
		`import type { ArcLevelStats } from "@/types/weapon"

export const arcLevelStats: Record<string, ArcLevelStats> = {
${[...levelStats]
	.sort(([a], [b]) => a.localeCompare(b))
	.map(([id, stats]) => `\t${id}: {\n\t\tatk: [${stats.atk.join(", ")}],\n\t\tmainStat: [${stats.mainStat.join(", ")}],\n\t},`)
	.join("\n")}
}
`
	)
	if (write && statsOutdated) written.push(`${statsFile} (${levelStats.size} arcs)`)

	// ---------- Report ----------

	console.log(`\n========== Arcs ==========`)
	console.log(`Read ${items.rows.length} arcs from ${sourceLabel}.`)
	console.log(`\nMatch the site: ${matching.length}`)

	console.log(`\nDiffer from the site (not changed, fix by hand if the game is right): ${changed.length}`)
	for (const [arc, diffs] of changed) {
		console.log(`\n  ${arc.name} (${arc.id})`)
		for (const diff of diffs) console.log(`    ${diff}`)
	}

	const unlinked = imported.filter((game) => game.effectUnlinked)
	if (unlinked.length > 0) {
		printList(
			"Effect values not in the tables (numbers are written into the text; check by hand)",
			unlinked,
			(game) => `${game.name} (${game.code})`
		)
	}

	printList("Placeholders the game has data for (and --update arcs)", fillable, ([arc]) => `${arc.name} (${arc.id})`)
	printList("In the game but not on the site", added, (game) => `${game.name} (${game.code})`)
	printList("On the site but not in the game", [...siteArcs.values()], (arc) => `${arc.name} (${arc.id})`)
	if (skipped.length > 0) printList("Couldn't read", skipped, (reason) => reason)

	if (written.length > 0) {
		printList("Wrote", written, (line) => line)
	} else if (!write && (fillable.length > 0 || added.length > 0 || statsOutdated)) {
		console.log(`\nRun again with --write to fill placeholders, add new arcs and update ${statsFile}.`)
	}
}
