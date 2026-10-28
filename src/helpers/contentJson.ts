// Shared by the /content-tool dev page and its server functions: turns the
// form's state into a content.json that `npm run content:add` accepts.

import type { ContentDateRef, ContentFile } from "@/types/content"

export const VERSION_PATTERN = /^\d+\.\d+$/
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?$/

// "Hunter's Crucible" → "hunters_crucible": apostrophes are dropped rather
// than turned into a break, matching the image and arc names in use.
export const snakeCase = (value: string) =>
	value
		.toLowerCase()
		.replace(/['’]/g, "")
		.replace(/[^a-z0-9]+/g, "_")
		.replace(/^_|_$/g, "")

// ---------- Cleaning ----------

// Drops empty strings, empty lists and empty objects, so a field left blank
// in the form is left out of the file and the script uses its placeholder.
function prune(value: unknown): unknown {
	if (typeof value === "string") return value.trim() === "" ? undefined : value.trim()
	if (Array.isArray(value)) {
		const list = value.map(prune).filter((item) => item !== undefined)
		return list.length > 0 ? list : undefined
	}
	if (value && typeof value === "object") {
		const entries = Object.entries(value)
			.map(([key, item]) => [key, prune(item)] as const)
			.filter(([, item]) => item !== undefined)
		return entries.length > 0 ? Object.fromEntries(entries) : undefined
	}
	return value
}

export function cleanContent(content: ContentFile): ContentFile {
	return { ...(prune(content) as ContentFile), version: content.version.trim() }
}

// ---------- Formatting ----------

const MAX_INLINE = 80

// Tab-indented like the hand-written files: an object or list that is the
// value of a key goes on one line when it holds no nested containers and
// fits ("arcBanner", "btr", "rewards"); list entries always get their own
// lines.
export function formatContentJson(content: ContentFile) {
	const format = (value: unknown, indent: string, inlineable: boolean): string => {
		if (value === null || typeof value !== "object") return JSON.stringify(value)

		const isList = Array.isArray(value)
		const items: [string | null, unknown][] = isList
			? value.map((item) => [null, item])
			: Object.entries(value)
		if (items.length === 0) return isList ? "[]" : "{}"

		const [open, close] = isList ? ["[", "]"] : ["{", "}"]
		const isLeaf = items.every(([, item]) => item === null || typeof item !== "object")

		if (inlineable && isLeaf) {
			const parts = items.map(([key, item]) => (key === null ? "" : `${JSON.stringify(key)}: `) + JSON.stringify(item))
			const line = isList ? `[${parts.join(", ")}]` : `{ ${parts.join(", ")} }`
			if (indent.length * 4 + line.length <= MAX_INLINE) return line
		}

		const inner = `${indent}\t`
		const lines = items.map(
			([key, item]) =>
				`${inner}${key === null ? "" : `${JSON.stringify(key)}: `}${format(item, inner, key !== null)}`
		)
		return `${open}\n${lines.join(",\n")}\n${indent}${close}`
	}

	return `${format(cleanContent(content), "", false)}\n`
}

// ---------- Validation ----------

export type ContentIssue = { where: string; message: string }

export type ValidationContext = {
	// Ids already on the site, plus the version keys ("version1_5") that
	// already have phase dates in patches.ts.
	characterIds: string[]
	arcIds: string[]
	materialIds: string[]
	versionsWithDates: string[]
}

export const isDate = (value: string) => DATE_PATTERN.test(value)

const isDateRef = (value: ContentDateRef) =>
	value === "phase1" || value === "phase2" || value === "end" || isDate(value)

// Errors are what would make content:add stop or write broken data;
// warnings are what it would fill with a placeholder.
export function validateContent(content: ContentFile, context: ValidationContext) {
	const errors: ContentIssue[] = []
	const warnings: ContentIssue[] = []
	const error = (where: string, message: string) => errors.push({ where, message })
	const warn = (where: string, message: string) => warnings.push({ where, message })

	const file = cleanContent(content)

	if (!VERSION_PATTERN.test(file.version ?? "")) error("version", 'must look like "1.5"')

	const versionKey = `version${(file.version ?? "").replace(".", "_")}`
	if (file.patch) {
		const { phase1Start, phase2Start, end } = file.patch
		for (const [key, value] of Object.entries({ phase1Start, phase2Start, end })) {
			if (!value) error(`patch.${key}`, "is required")
			else if (!isDate(value)) error(`patch.${key}`, `"${value}" isn't a date like 2026-11-11`)
		}
		if (phase1Start && phase2Start && end && !(phase1Start < phase2Start && phase2Start < end)) {
			error("patch", "dates must run phase 1 start → phase 2 start → end")
		}
	} else if (!context.versionsWithDates.includes(versionKey)) {
		error("patch", `${versionKey} has no phase dates yet, so the patch section is needed`)
	}

	const characterIds = new Set(context.characterIds)
	const seenCharacters = new Set<string>()
	for (const [index, character] of (file.characters ?? []).entries()) {
		const where = `characters[${index}] ${character.name ?? ""}`.trim()
		if (!character.id) error(where, "needs an id")
		else if (!/^[a-z0-9]+$/.test(character.id)) error(where, `id "${character.id}" should be lowercase letters and digits`)
		else if (seenCharacters.has(character.id)) error(where, `id "${character.id}" is listed twice`)
		if (!character.name) error(where, "needs a name")
		if (character.id) {
			seenCharacters.add(character.id)
			characterIds.add(character.id)
		}

		if (!character.rarity) warn(where, "no rarity, the script uses S")
		if (!character.element) warn(where, "no element, the script uses cosmos")
		if (!character.arcType) warn(where, "no arc type (shown as a placeholder)")
		const { ascension, ascensionBoss, talent, talentBoss } = character.materials ?? {}
		if ([ascension, ascensionBoss, talent, talentBoss].includes(undefined)) {
			warn(where, "materials incomplete, so it stays out of the planner")
		}
	}

	const arcIds = new Set(context.arcIds)
	const seenArcs = new Set<string>()
	for (const [index, arc] of (file.arcs ?? []).entries()) {
		const where = `arcs[${index}] ${arc.name ?? ""}`.trim()
		if (!arc.id) error(where, "needs an id")
		else if (!/^[a-z0-9_]+$/.test(arc.id)) error(where, `id "${arc.id}" should be snake_case`)
		else if (seenArcs.has(arc.id)) error(where, `id "${arc.id}" is listed twice`)
		if (!arc.name) error(where, "needs a name")
		if (arc.id) {
			seenArcs.add(arc.id)
			arcIds.add(arc.id)
		}

		if (!arc.rarity) warn(where, "no rarity, the script uses S")
		if (!arc.type) warn(where, "no type, the script uses Solid")
		if (arc.effect && (!arc.effect.name || !arc.effect.description)) {
			error(`${where} effect`, "needs both a name and a description, or neither")
		}
		for (const [tier, values] of Object.entries(arc.effect?.values ?? {})) {
			for (const value of values) {
				if (typeof value === "string" && !/^-?\d+(?:\.\d+)?%$/.test(value)) {
					error(`${where} tier ${tier}`, `"${value}" should be a number or a percentage like "16%"`)
				}
			}
		}
	}

	for (const [index, banner] of (file.banners ?? []).entries()) {
		const where = `banners[${index}] ${banner.character ?? ""}`.trim()
		if (!banner.character) error(where, "needs a character")
		else if (!characterIds.has(banner.character)) error(where, `unknown character "${banner.character}"`)
		if (banner.phase !== 1 && banner.phase !== 2) error(where, "phase must be 1 or 2")
		if (banner.arcBanner) {
			if (!banner.arcBanner.arc) error(`${where} arc banner`, "needs an arc")
			else if (!arcIds.has(banner.arcBanner.arc)) error(`${where} arc banner`, `unknown arc "${banner.arcBanner.arc}"`)
			if (!banner.arcBanner.name) error(`${where} arc banner`, "needs a name")
		}
		if (!banner.name) warn(where, `no name, so it shows as "Phase ${banner.phase}: …"`)
	}

	const materialIds = new Set(context.materialIds)
	for (const [index, event] of (file.events ?? []).entries()) {
		const where = `events[${index}] ${event.name ?? ""}`.trim()
		if (!event.name) error(where, "needs a name")
		if (!event.start || !isDateRef(event.start)) error(where, "start must be phase1, phase2 or a date")
		if (!event.end || !isDateRef(event.end)) error(where, "end must be phase1, phase2, end or a date")
		for (const reward of event.rewards ?? []) {
			if (!materialIds.has(reward)) error(where, `unknown reward "${reward}"`)
		}
	}

	return { errors, warnings }
}

// ---------- Images ----------

export type ExpectedImage = {
	// File name in the intake folder, and where content:add copies it.
	file: string
	destination: string
	label: string
}

// The images content:add looks for, named the way it names them.
export function expectedImages(content: ContentFile): ExpectedImage[] {
	const file = cleanContent(content)
	const version = file.version
	const eventsFolder = `events/version${version}`
	const images: ExpectedImage[] = []

	if (file.patch || file.events) {
		images.push({
			file: `version_${version}.webp`,
			destination: `${eventsFolder}/version_${version}.webp`,
			label: "Version banner",
		})
	}
	for (const character of file.characters ?? []) {
		if (!character.id) continue
		images.push(
			{ file: `avatar_${character.id}.webp`, destination: `characters/avatar/${character.id}.webp`, label: `${character.name} avatar` },
			{ file: `full_${character.id}.webp`, destination: `characters/full/${character.id}.webp`, label: `${character.name} full art` },
			{ file: `background_${character.id}.png`, destination: `characters/background/${character.id}.png`, label: `${character.name} background` }
		)
	}
	for (const arc of file.arcs ?? []) {
		if (!arc.id) continue
		images.push({ file: `arc_${arc.id}.webp`, destination: `arcs/${arc.id}.webp`, label: `${arc.name} art` })
	}
	for (const banner of file.banners ?? []) {
		if (!banner.character) continue
		const name = `gacha_${banner.character}`
		images.push({ file: `${name}.webp`, destination: `${eventsFolder}/${name}.webp`, label: `${banner.character} banner` })
	}
	for (const event of file.events ?? []) {
		if (!event.name) continue
		const name = event.image ?? `event_${snakeCase(event.name)}`
		images.push({ file: `${name}.webp`, destination: `${eventsFolder}/${name}.webp`, label: event.name })
	}

	return images
}

// ---------- Calendar size ----------

// The event calendar draws a day this wide (daySize in EventCalendar.tsx).
export const CALENDAR_DAY_REM = 2.5

const dayNumber = (value: string | undefined) => {
	const match = value?.match(DATE_PATTERN)
	return match ? Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])) / 86_400_000 : undefined
}

// An item's first and last whole day on the calendar (as day numbers), with
// phase references resolved from the patch dates. Undefined until the dates
// it needs are filled in.
//
// The data's boundaries (events/event.ts): a dated start is that day's reset
// (serverSOD) and a dated end is the minute before it (serverEOD), so an
// event ending "2026-11-23" is over as the 23rd begins and another starting
// that day fits right after it. The patch ends late on its end day
// (globalPatchEnd), and phase 1 the day before phase 2 starts, so those
// count as whole days.
export function calendarRange(patch: ContentFile["patch"], start: ContentDateRef, end: ContentDateRef) {
	const phase2 = dayNumber(patch?.phase2Start)
	const endDay = dayNumber(end)
	const first = start === "phase1" ? dayNumber(patch?.phase1Start) : start === "phase2" ? phase2 : dayNumber(start)
	const last =
		end === "phase1"
			? phase2 === undefined
				? undefined
				: phase2 - 1
			: end === "phase2" || end === "end"
				? dayNumber(patch?.end)
				: endDay === undefined
					? undefined
					: endDay - 1

	if (first === undefined || last === undefined || last < first) return undefined
	return [first, last] as const
}

// How many days an item spans on the calendar, counting both its first and
// last day.
export function calendarDays(patch: ContentFile["patch"], start: ContentDateRef, end: ContentDateRef) {
	const range = calendarRange(patch, start, end)
	return range && range[1] - range[0] + 1
}

const shortDate = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" })

// The calendar item's date line, "Nov 16 ▸ Nov 23". Like the site, the end
// shown is the day the item stops: the day after its last whole day.
export function calendarDates(patch: ContentFile["patch"], start: ContentDateRef, end: ContentDateRef) {
	const range = calendarRange(patch, start, end)
	return range && [range[0], range[1] + 1].map((day) => shortDate.format(day * 86_400_000)).join(" ▸ ")
}
