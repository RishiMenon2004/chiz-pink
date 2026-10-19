// --images <intake folder>: fetches the game art for the characters and arcs
// listed in that folder's content.json, ready for content:add to copy into
// public/:
//
//   arc_<id>.webp         the arc's 1024px art
//   full_<id>.webp        the character's 2160x2560 outfit art
//   avatar_<id>.webp      a 256px square cut from that art, where the game's
//                         circle-cropped icon sits (the icons themselves
//                         can't be used since the circle crop)
//   background_<id>.png   the character's profile background (awakening art)
//
// Files already in the folder are left alone, so hand-made ones win.

import { existsSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"

import sharp from "sharp"

import { SITE_IDS } from "./characters"
import {
	fail,
	fromRoot,
	listAssets,
	type LocalizedText,
	type Localization,
	matchKey,
	printList,
	readAsset,
	readSource,
	readTable,
	TEXT_FILE,
	textLookup,
} from "./source"

type AssetPath = { AssetPathName: string }
type CharacterRow = {
	ItemName: LocalizedText
	ItemIconBig?: AssetPath
	ElementData: { CharacterIllustration?: AssetPath }
}
type ArcRow = {
	ItemName: LocalizedText
	ElementData: { OriginalPainting?: AssetPath }
}
type Intake = {
	characters?: { id: string; name: string }[]
	arcs?: { id: string; name: string }[]
}

// ---------- Avatar crop ----------

type Pixels = { data: Buffer; width: number; height: number }

const pixels = async (input: Buffer, width: number, height: number): Promise<Pixels> => {
	const { data, info } = await sharp(input)
		.ensureAlpha()
		.resize(width, height, { fit: "fill" })
		.raw()
		.toBuffer({ resolveWithObject: true })
	return { data, width: info.width, height: info.height }
}

// How far the icon is from the art at (x, y): mean squared difference over
// the icon's opaque (inside the circle) pixels. The art can be transparent
// around the character, so it's compared as if drawn on black.
function distance(icon: Pixels, art: Pixels, x: number, y: number) {
	let sum = 0
	let count = 0
	for (let j = 0; j < icon.height; j++) {
		for (let i = 0; i < icon.width; i++) {
			const a = (j * icon.width + i) * 4
			if (icon.data[a + 3] < 250) continue
			const ax = x + i
			const ay = y + j
			if (ax < 0 || ay < 0 || ax >= art.width || ay >= art.height) return Infinity
			const b = (ay * art.width + ax) * 4
			const alpha = art.data[b + 3] / 255
			for (let c = 0; c < 3; c++) {
				const d = icon.data[a + c] - art.data[b + c] * alpha
				sum += d * d
			}
			count++
		}
	}
	return sum / count
}

const range = (from: number, to: number, step: number) => {
	const values: number[] = []
	for (let v = from; v <= to; v += step) values.push(v)
	return values
}

// Finds the square of the art the icon was cut from: a coarse search over
// every size and position on a small copy, then two finer passes around the
// best match. Sizes and positions are in full-size art pixels.
async function findIconSquare(icon: Buffer, art: Buffer) {
	const { width = 0, height = 0 } = await sharp(art).metadata()

	type Match = { score: number; size: number; x: number; y: number }
	const search = async (scale: number, sizes: number[], xs: (size: number) => number[], ys: (size: number) => number[]) => {
		const small = await pixels(art, Math.round(width / scale), Math.round(height / scale))
		let best: Match = { score: Infinity, size: 0, x: 0, y: 0 }
		for (const size of sizes) {
			const iconSmall = await pixels(icon, Math.max(4, Math.round(size / scale)), Math.max(4, Math.round(size / scale)))
			for (const x of xs(size)) {
				for (const y of ys(size)) {
					const score = distance(iconSmall, small, Math.round(x / scale), Math.round(y / scale))
					if (score < best.score) best = { score, size, x, y }
				}
			}
		}
		return best
	}

	let best = await search(
		24,
		range(240, Math.min(width, height), 24),
		(size) => range(0, width - size, 24),
		(size) => range(0, height - size, 24)
	)
	for (const [scale, reach, step] of [
		[6, 30, 6],
		[2, 8, 2],
	]) {
		const around = best
		best = await search(
			scale,
			range(around.size - reach, around.size + reach, step),
			() => range(around.x - reach, around.x + reach, step),
			() => range(around.y - reach, around.y + reach, step)
		)
	}
	return best
}

// Outfit-art code names whose awakening folder is named differently.
const AWAKEN_FOLDERS: Record<string, string> = {
	baizang: "Baicang",
	naniya: "Haniya",
	nanzhu: "Zero",
	nvzhu: "Zero",
}

// ---------- Fetching ----------

export async function importImages(folderArg: string) {
	const folder = path.resolve(fromRoot(), folderArg)
	const contentPath = path.join(folder, "content.json")
	if (!existsSync(contentPath)) fail(`no content.json in ${folderArg}`)
	const intake: Intake = JSON.parse(readFileSync(contentPath, "utf8"))

	const [characters, arcs, localization] = await Promise.all([
		readTable<CharacterRow>(["DataTable/Character/DT_Character.json"]),
		readTable<ArcRow>(["DataTable/Fork/DT_ForkItemData.json"]),
		readSource(TEXT_FILE) as Promise<Localization>,
	])
	const text = textLookup(localization)

	// Game rows by the site name they match (the first row wins, as alternate
	// versions of a character share its name).
	const byName = <T extends { ItemName: LocalizedText }>(rows: [string, T][]) => {
		const map = new Map<string, T>()
		for (const [, row] of rows) {
			const name = text(row.ItemName.Key)
			if (!name) continue
			const key = matchKey(name)
			if (!map.has(key)) map.set(key, row)
			if (SITE_IDS[name]) map.set(`id:${SITE_IDS[name]}`, row)
		}
		return map
	}
	const characterRows = byName(characters.rows)
	const arcRows = byName(arcs.rows)

	const done: string[] = []
	const kept: string[] = []
	const missing: string[] = []

	// Writes one image unless the folder already has it.
	const save = async (file: string, make: () => Promise<Buffer | undefined>) => {
		const target = path.join(folder, file)
		if (existsSync(target)) {
			kept.push(file)
			return
		}
		try {
			const image = await make()
			if (!image) {
				missing.push(`${file}: not in the game data`)
				return
			}
			writeFileSync(target, image)
			done.push(file)
		} catch (error) {
			missing.push(`${file}: ${(error as Error).message}`)
		}
	}

	const webp = (image: Buffer | sharp.Sharp) => (Buffer.isBuffer(image) ? sharp(image) : image).webp({ quality: 90 }).toBuffer()

	for (const arc of intake.arcs ?? []) {
		const row = arcRows.get(matchKey(arc.name))
		const painting = row?.ElementData.OriginalPainting?.AssetPathName
		await save(`arc_${arc.id}.webp`, async () => (painting ? webp(await readAsset(painting)) : undefined))
	}

	const awakenFolders = (intake.characters?.length ?? 0) > 0 ? await listAssets("/Game/UI/UI/Awaken") : []

	for (const character of intake.characters ?? []) {
		const row = characterRows.get(`id:${character.id}`) ?? characterRows.get(matchKey(character.name))
		const illustration = row?.ElementData.CharacterIllustration?.AssetPathName
		const icon = row?.ItemIconBig?.AssetPathName
		const art = illustration ? await readAsset(illustration).catch(() => undefined) : undefined

		await save(`full_${character.id}.webp`, async () => art && webp(art))

		await save(`avatar_${character.id}.webp`, async () => {
			if (!art || !icon) return undefined
			const { x, y, size } = await findIconSquare(await readAsset(icon), art)
			return webp(sharp(art).extract({ left: x, top: y, width: size, height: size }).resize(256, 256))
		})

		// The awakening art lives under the character's code name, the one
		// the outfit art is named after ("YH_UI_shizhuang_big_mingyin").
		await save(`background_${character.id}.png`, async () => {
			const outfitName = illustration?.match(/shizhuang_big_([a-z0-9]+?)\d*\./i)?.[1].toLowerCase()
			if (!outfitName) return undefined
			const codeName = AWAKEN_FOLDERS[outfitName] ?? outfitName
			const awakenFolder = awakenFolders.find((name) => name.toLowerCase() === codeName.toLowerCase())
			if (!awakenFolder) return undefined
			const files = await listAssets(`/Game/UI/UI/Awaken/${awakenFolder}`)
			const background = files.find((name) => /_Awaken_.*_Bg(\.png)?$/i.test(name))
			if (!background) return undefined
			return readAsset(`/Game/UI/UI/Awaken/${awakenFolder}/${background.replace(/\.png$/i, "")}`)
		})
	}

	console.log(`\n========== Images (${folderArg}) ==========`)
	printList("Fetched (check them before running content:add)", done, (file) => file)
	printList("Already in the folder, left alone", kept, (file) => file)
	printList("Not available", missing, (line) => line)
}
