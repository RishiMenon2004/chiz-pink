// npm run content:check
//
// Lists everything in the site's content that is unfinished or broken, so a
// content update can be checked before committing. Read-only.
//
// Problems (broken tags, missing value slots, image files that don't exist)
// make it exit with code 1. Unfinished content (placeholders, unnamed
// banners, events still waiting on an image) is listed but doesn't fail.

import { existsSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import type { Arc } from "@/types/weapon"
import type { Character } from "@/types/character"

import { BTRTimeline, Events, patchTimings } from "@/data/activities/events"
import { arcLevelStats } from "@/data/arcs/arcLevelStats"
import { getAllArcsList } from "@/data/arcs/arcList"
import { EnumCharacterElement } from "@/data/characters/character"
import { getAllCharactersList } from "@/data/characters/characterList"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const publicFile = (...parts: string[]) => path.join(root, "public", ...parts)

// Events of a version past this age only feed the calendar and can go;
// gacha banners stay forever for the pull tracker and theme colours.
const PURGE_AFTER_MS = 2 * 365 * 24 * 60 * 60 * 1000

// Tags parseDescription understands, and the shape it matches:
// <name attr="…">text</>, with no nesting.
const KNOWN_TAGS = new Set(["dn", "sh", "link", "tag", "ntetag", "itag", "el", "kw"])
const TAG_CHUNK = /<([a-z]+)((?:\s+[a-z]+=(?:"[^"]*"|'[^']*'))*)>([^<]+)<\/>/g
const ELEMENTS = new Set<string>(Object.values(EnumCharacterElement))

type Section = { title: string; lines: string[] }

const problems: Section[] = []
const unfinished: Section[] = []

function section(list: Section[], title: string, lines: string[]) {
	if (lines.length > 0) list.push({ title, lines })
}

const characters = getAllCharactersList()
const arcs = getAllArcsList()
const label = (item: { id: string; name: string }) => `${item.name} (${item.id})`

// ---------- Description tags ----------

function checkTags(where: string, text: string): string[] {
	const issues: string[] = []

	for (const [, name, , inner] of text.matchAll(TAG_CHUNK)) {
		if (!KNOWN_TAGS.has(name)) {
			issues.push(`${where}: unknown tag <${name}>`)
		}
		if (name === "el" && !ELEMENTS.has(inner.split(" ")[0].toLowerCase())) {
			issues.push(`${where}: <el>${inner}</> doesn't start with an element name`)
		}
	}

	const leftover = text.replace(TAG_CHUNK, "")
	const stray = leftover.indexOf("<")
	if (stray !== -1) {
		const snippet = leftover.slice(Math.max(0, stray - 20), stray + 30).replace(/\n/g, " ")
		issues.push(`${where}: unclosed or malformed tag near "${snippet}"`)
	}

	return issues
}

function characterTexts(character: Character): [string, string][] {
	const texts: [string, string][] = [["description", character.description]]

	for (const [key, ability] of Object.entries(character.abilities)) {
		if (!ability) continue
		ability.description.forEach(({ section, description }, index) => {
			texts.push([`${key} ${section ?? `#${index + 1}`}`, description])
		})
	}

	return texts
}

function arcTexts(arc: Arc): [string, string][] {
	return [
		["description", arc.description ?? ""],
		["effect", arc.effect.description],
	]
}

section(problems, "Broken description tags", [
	...characters.flatMap((character) =>
		characterTexts(character).flatMap(([where, text]) =>
			checkTags(`${label(character)} ${where}`, text)
		)
	),
	...arcs.flatMap((arc) =>
		arcTexts(arc).flatMap(([where, text]) => checkTags(`${label(arc)} ${where}`, text))
	),
])

// An arc effect's {n} reads values[tier][n]; every tier needs every slot.
section(
	problems,
	"Arc effect values missing",
	arcs.flatMap((arc) => {
		const slots = [...arc.effect.description.matchAll(/\{(\d+)\}/g)].map((m) =>
			Number(m[1])
		)
		const tiers = Object.entries(arc.effect.values)
		if (slots.length > 0 && tiers.length === 0) {
			return [`${label(arc)}: uses {${slots.join("}, {")}} but has no values`]
		}

		return tiers.flatMap(([tier, values]) =>
			slots
				.filter((slot) => !values[slot])
				.map((slot) => `${label(arc)}: tier ${tier} has no value for {${slot}}`)
		)
	})
)

// ---------- Images ----------

const missingImages: string[] = []
const placeholderImages: string[] = []
const missingBackgrounds: string[] = []

for (const character of characters) {
	if (character.imageSrc === "placeholder.webp") {
		placeholderImages.push(`${label(character)} uses the placeholder image`)
		continue
	}
	for (const folder of ["avatar", "full"]) {
		if (!existsSync(publicFile("characters", folder, character.imageSrc))) {
			missingImages.push(`${label(character)}: characters/${folder}/${character.imageSrc}`)
		}
	}
	if (!existsSync(publicFile("characters", "background", `${character.id}.png`))) {
		missingBackgrounds.push(`${label(character)}: characters/background/${character.id}.png`)
	}
}

for (const arc of arcs) {
	if (arc.imageSrc === "placeholder.webp") {
		placeholderImages.push(`${label(arc)} uses the placeholder image`)
	} else if (!existsSync(publicFile("arcs", arc.imageSrc))) {
		missingImages.push(`${label(arc)}: arcs/${arc.imageSrc}`)
	}
}

const eventsWithoutImage: string[] = []

for (const event of Events) {
	if (!event.eventImage) {
		eventsWithoutImage.push(`${event.type}: ${event.name}`)
	} else if (!existsSync(publicFile("events", event.eventImage))) {
		missingImages.push(`${event.type} "${event.name}": events/${event.eventImage}`)
	}
}

section(problems, "Image files that don't exist", missingImages)

// ---------- Unfinished content ----------

section(
	unfinished,
	"Placeholder characters (kit not announced yet)",
	characters.filter((c) => c.isPlaceholder).map(label)
)
section(
	unfinished,
	"Placeholder arcs (stats not out yet)",
	arcs.filter((a) => a.isPlaceholder).map(label)
)
section(
	unfinished,
	"Arcs without level stats (run npm run content:import -- --write)",
	arcs.filter((a) => !a.isPlaceholder && !arcLevelStats[a.id]).map(label)
)
section(unfinished, "Placeholder images", placeholderImages)
section(unfinished, "Characters without a profile background", missingBackgrounds)
section(unfinished, "Events without an image", eventsWithoutImage)
section(
	unfinished,
	"Gacha banners still using a phase name",
	Events.filter((e) => e.type === "Gacha" && /^Phase \d+:/.test(e.name)).map((e) => e.name)
)
section(
	unfinished,
	"BTR circles not named yet",
	BTRTimeline.filter((e) => e.name === "TBA").map(
		(e) => `TBA starting ${new Date(e.getStartDate("Asia")).toISOString().slice(0, 10)}`
	)
)
section(
	unfinished,
	"Still flagged isPreview (only needed until a banner is scheduled)",
	[...characters, ...arcs].filter((item) => item.isPreview).map(label)
)

const now = Date.now()
section(
	unfinished,
	"Versions past the purge cutoff (drop their calendar events, keep gacha banners)",
	Object.entries(patchTimings)
		.filter(([, timings]) => timings.phase2End() < now - PURGE_AFTER_MS)
		.map(([version]) => `${version}: delete events/${version}.ts's events and its event images`)
)

// ---------- Report ----------

function print(heading: string, sections: Section[]) {
	const count = sections.reduce((total, { lines }) => total + lines.length, 0)
	console.log(`\n${heading} (${count})`)
	if (count === 0) {
		console.log("  none")
		return
	}
	for (const { title, lines } of sections) {
		console.log(`\n  ${title}: ${lines.length}`)
		for (const line of lines) console.log(`    - ${line}`)
	}
}

console.log(
	`Checked ${characters.length} characters, ${arcs.length} arcs, ${Events.length} events and ${BTRTimeline.length} BTR circles.`
)
print("Problems", problems)
print("Unfinished", unfinished)

if (problems.length > 0) process.exitCode = 1
