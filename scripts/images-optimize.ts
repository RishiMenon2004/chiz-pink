// npm run images:optimize [-- --write]
//
// Checks (or with --write, re-encodes in place) existing game art in public/
// using the same presets as content:import and content:add.

import { existsSync, readdirSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import {
	formatKb,
	IMAGE_PRESETS,
	type ImagePresetKey,
	optimizeImageFile,
} from "./image-optimize"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const writeMode = process.argv.slice(2).includes("--write")

const TARGETS: { dir: string; preset: ImagePresetKey }[] = [
	{ dir: "public/characters/full", preset: "characterFull" },
	{ dir: "public/characters/avatar", preset: "characterAvatar" },
	{ dir: "public/characters/background", preset: "characterBackground" },
	{ dir: "public/arcs", preset: "arc" },
	{ dir: "public/events", preset: "event" },
]

function walkFiles(dir: string, extension: string): string[] {
	if (!existsSync(dir)) return []
	const files: string[] = []
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const fullPath = path.join(dir, entry.name)
		if (entry.isDirectory()) {
			files.push(...walkFiles(fullPath, extension))
		} else if (path.extname(entry.name).toLowerCase() === extension) {
			files.push(fullPath)
		}
	}
	return files
}

let totalBefore = 0
let totalAfter = 0
let totalChecked = 0
let totalChanged = 0

for (const { dir, preset } of TARGETS) {
	const extension = `.${IMAGE_PRESETS[preset].format}`
	const files = walkFiles(path.join(root, dir), extension)
	let dirBefore = 0
	let dirAfter = 0
	let dirChanged = 0

	for (const file of files) {
		const result = await optimizeImageFile(file, preset)
		dirBefore += result.beforeBytes
		dirAfter += result.afterBytes
		if (result.changed) {
			dirChanged++
			if (writeMode) writeFileSync(file, result.buffer)
		}
	}

	totalBefore += dirBefore
	totalAfter += dirAfter
	totalChecked += files.length
	totalChanged += dirChanged

	const savedPct =
		dirBefore > 0
			? (((dirBefore - dirAfter) / dirBefore) * 100).toFixed(1)
			: "0.0"
	console.log(
		`${dir}: ${dirChanged}/${files.length} ${writeMode ? "optimized" : "optimizable"} (${formatKb(dirBefore)} → ${formatKb(dirAfter)}, -${savedPct}%)`
	)
}

const totalSavedMb = ((totalBefore - totalAfter) / (1024 * 1024)).toFixed(1)
const totalPct =
	totalBefore > 0
		? (((totalBefore - totalAfter) / totalBefore) * 100).toFixed(1)
		: "0.0"
console.log(
	`\nTotal: ${totalChanged}/${totalChecked} files, ${(totalBefore / (1024 * 1024)).toFixed(1)} MB → ${(totalAfter / (1024 * 1024)).toFixed(1)} MB (-${totalSavedMb} MB, -${totalPct}%)`
)
if (!writeMode && totalChanged > 0) {
	console.log("Dry run only. Pass --write to optimize files in place.")
}
