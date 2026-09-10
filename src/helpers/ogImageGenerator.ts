import fs from "node:fs"
import path from "node:path"
import sharp from "sharp"

import { EnumRarity } from "@/data/items"
import { initFontConfig } from "@/helpers/fontConfig"
import type { Character } from "@/types/character"
import type { Arc } from "@/types/weapon"

// Initialize fontconfig to load local TTF fonts in Linux/Vercel serverless
initFontConfig()

// Cached in-memory font CSS to inline embedded base64 fonts
let cachedFontDefs: string | null = null

function getEmbeddedFontsDef(): string {
	if (cachedFontDefs) return cachedFontDefs

	try {
		const fontsDir = path.join(process.cwd(), "public", "fonts")
		const synePath = path.join(fontsDir, "Syne-ExtraBold.ttf")
		const barlowBoldPath = path.join(
			fontsDir,
			"BarlowCondensed-BoldItalic.ttf"
		)
		const barlowMedPath = path.join(
			fontsDir,
			"BarlowCondensed-MediumItalic.ttf"
		)

		const syneBuf = fs.readFileSync(synePath).toString("base64")
		const barlowBoldBuf = fs.readFileSync(barlowBoldPath).toString("base64")
		const barlowMedBuf = fs.readFileSync(barlowMedPath).toString("base64")

		cachedFontDefs = `
			<style>
				@font-face {
					font-family: 'Syne';
					font-style: normal;
					font-weight: 800;
					src: url('data:font/truetype;base64,${syneBuf}') format('truetype');
				}
				@font-face {
					font-family: 'Barlow Condensed';
					font-style: italic;
					font-weight: 700;
					src: url('data:font/truetype;base64,${barlowBoldBuf}') format('truetype');
				}
				@font-face {
					font-family: 'Barlow Condensed';
					font-style: italic;
					font-weight: 500;
					src: url('data:font/truetype;base64,${barlowMedBuf}') format('truetype');
				}
			</style>
		`
	} catch (err) {
		console.warn("Could not load local fonts for OG image embedding:", err)
		cachedFontDefs = ""
	}

	return cachedFontDefs
}

export function formatRarity(
	rarity: EnumRarity | string | number | undefined
): string {
	if (typeof rarity === "number") {
		return EnumRarity[rarity] ?? String(rarity)
	}
	return String(rarity ?? "")
}

function escapeXml(str: string | undefined): string {
	return String(str ?? "")
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;")
}

function wrapText(text: string, maxCharsPerLine = 42, maxLines = 3): string[] {
	if (!text) return []
	const words = text.split(" ")
	const lines: string[] = []
	let currentLine = ""
	let truncated = false

	for (let i = 0; i < words.length; i++) {
		const word = words[i]
		const testLine = currentLine ? `${currentLine} ${word}` : word

		// If filling the final allowed line
		if (lines.length === maxLines - 1) {
			if (testLine.length <= maxCharsPerLine) {
				currentLine = testLine
			} else {
				truncated = true
				break
			}
		} else {
			if (testLine.length <= maxCharsPerLine) {
				currentLine = testLine
			} else {
				if (currentLine) lines.push(currentLine)
				currentLine = word
			}
		}
	}

	if (currentLine && lines.length < maxLines) {
		if (truncated) {
			const cleaned = currentLine.replace(/[.,!?;:]+$/, "")
			lines.push(`${cleaned}...`)
		} else {
			lines.push(currentLine)
		}
	}
	return lines
}

// Syne 800 character widths relative to fontSize (derived from actual font metrics)
const SYNE_CHAR_WIDTHS: Record<string, number> = {
	"0": 1.24,
	"1": 0.69,
	"2": 1.19,
	"3": 1.36,
	"4": 1.24,
	"5": 1.25,
	"6": 1.29,
	"7": 1.4,
	"8": 1.29,
	"9": 1.45,
	A: 1.15,
	B: 1.32,
	C: 1.46,
	D: 1.47,
	E: 1.31,
	F: 1.31,
	G: 1.47,
	H: 1.44,
	I: 0.57,
	J: 1.13,
	K: 1.35,
	L: 0.56,
	M: 1.74,
	N: 1.46,
	O: 1.47,
	P: 1.35,
	Q: 1.59,
	R: 1.39,
	S: 1.24,
	T: 1.17,
	U: 1.41,
	V: 1.24,
	W: 1.96,
	X: 1.33,
	Y: 1.13,
	Z: 1.36,
	" ": 0.45,
	"-": 0.65,
	"'": 0.47,
	",": 0.35,
	".": 0.35,
	"!": 0.58,
	"?": 1.1,
	":": 0.53,
	'"': 0.77,
}

function measureSyneTextWidth(text: string, fontSize: number): number {
	let units = 0
	for (const ch of text.toUpperCase()) {
		units += SYNE_CHAR_WIDTHS[ch] ?? 1.15
	}
	return units * fontSize
}

function layoutArcName(
	name: string,
	maxWidth = 480,
	minFontSize = 28,
	maxFontSize = 58
): {
	fontSize: number
	tspans: string
} {
	const upperName = name.toUpperCase()

	// 1. Check if name fits on a single line at minFontSize (28px)
	const widthAtMin = measureSyneTextWidth(upperName, minFontSize)

	if (widthAtMin <= maxWidth) {
		// Scales UP or DOWN to fill the space
		const idealSize = Math.floor(
			maxWidth / measureSyneTextWidth(upperName, 1)
		)
		const fontSize = Math.min(maxFontSize, Math.max(minFontSize, idealSize))

		// Precise optical vertical centering for single line in 128px banner (y=144 to y=272, center=208)
		const baselineY = 208 + fontSize * 0.33

		return {
			fontSize,
			tspans: `<tspan x="64" y="${baselineY.toFixed(1)}">${escapeXml(upperName)}</tspan>`,
		}
	}

	// 2. Otherwise: wrap words at minFontSize (28px)
	const words = upperName.split(" ")
	const lines: string[] = []
	let currentLine = ""

	for (let i = 0; i < words.length; i++) {
		const word = words[i]
		const testLine = currentLine ? `${currentLine} ${word}` : word
		if (measureSyneTextWidth(testLine, minFontSize) <= maxWidth) {
			currentLine = testLine
		} else {
			if (currentLine) lines.push(currentLine)
			currentLine = word
		}
	}
	if (currentLine) lines.push(currentLine)

	const fontSize = minFontSize

	let tspans = ""
	if (lines.length === 2) {
		// Exact optical vertical centering for 2 lines in 128px banner (gap 34px, 38px top pad, 38px bottom pad)
		const line1Y = 200.5
		const line2Y = 234.5
		tspans = `<tspan x="64" y="${line1Y}">${escapeXml(lines[0])}</tspan><tspan x="64" y="${line2Y}">${escapeXml(lines[1])}</tspan>`
	} else {
		// Exact optical vertical centering for 3 or more lines in 128px banner
		const gap = 32
		const startY = 208 - ((lines.length - 1) * gap) / 2 + 8.5
		tspans = lines
			.map(
				(l, i) =>
					`<tspan x="64" y="${(startY + i * gap).toFixed(1)}">${escapeXml(l)}</tspan>`
			)
			.join("")
	}

	return {
		fontSize,
		tspans,
	}
}

export async function generateCharacterOgImage(
	char: Character
): Promise<Response> {
	const templatePath = path.join(
		process.cwd(),
		"public",
		"layout",
		"character-og.svg"
	)
	let svg = fs.readFileSync(templatePath, "utf8")

	// Inject embedded local fonts into <defs>
	const fontDefs = getEmbeddedFontsDef()
	if (fontDefs) {
		svg = svg.replace("<defs>", `<defs>${fontDefs}`)
	}

	// 1. Full Splash Art
	const splashPath = path.join(
		process.cwd(),
		"public",
		"characters",
		"full",
		char.imageSrc
	)
	if (fs.existsSync(splashPath)) {
		const splashBuf = await sharp(splashPath)
			.resize(741, 741, { fit: "contain", position: "bottom" })
			.png()
			.toBuffer()
		const splashPngDataUrl = `data:image/png;base64,${splashBuf.toString("base64")}`
		svg = svg.replace(
			/<rect x="459" width="741" height="741" fill="#FF00FF"\/>/,
			`<image x="509" y="0" width="691" height="691" preserveAspectRatio="xMidYMid meet" xlink:href="${splashPngDataUrl}" />`
		)
	}

	// 2. Element Icon
	const elemIconName = `${char.element.toLowerCase()}.png`
	const elementPath = path.join(
		process.cwd(),
		"public",
		"icons",
		"elements",
		elemIconName
	)
	if (fs.existsSync(elementPath)) {
		const elemBuf = await sharp(elementPath).resize(39, 39).png().toBuffer()
		const elemDataUrl = `data:image/png;base64,${elemBuf.toString("base64")}`
		svg = svg.replace(
			/<image id="image0_1_2"[^>]+>/,
			`<image id="image0_1_2" width="512" height="512" preserveAspectRatio="none" xlink:href="${elemDataUrl}"/>`
		)
	}

	// 3. Dynamic Text Fields
	svg = svg.replace("{{NAME}}", escapeXml(char.name.toUpperCase()))
	svg = svg.replace("{{URL}}", escapeXml(`chiz.pink/characters/${char.id}`))
	svg = svg.replace("{{ELEMENT}}", escapeXml(char.element.toUpperCase()))
	svg = svg.replace(
		"{{ARC_TYPE}}",
		escapeXml(`${char.arcType.toUpperCase()} ARC`)
	)

	const rank = char.rarity === EnumRarity.Epic ? "S-RANK" : "A-RANK"
	svg = svg.replace("{{RANK}}", rank)

	// 4. Multiline Description with tspans
	const descLines = wrapText(`${char.description}`, 42, 3)
	const descTspans = descLines
		.map(
			(line, i) =>
				`<tspan x="64" y="${456.8 + i * 36}">${escapeXml(line)}</tspan>`
		)
		.join("")

	svg = svg.replace(
		/<text fill="#333333" style="white-space: pre" xml:space="preserve" font-family="Barlow Condensed" font-size="32" font-style="italic" font-weight="500" letter-spacing="0em"><tspan x="64" y="456.8">\{\{DESCRIPTION\}\}<\/tspan><\/text>/,
		`<text fill="#333333" style="white-space: pre" xml:space="preserve" font-family="Barlow Condensed, sans-serif" font-size="30" font-style="italic" font-weight="500" letter-spacing="0em">${descTspans}</text>`
	)

	// 5. Dynamic Stars: Dim 5th star if rarity < Epic (5)
	if (char.rarity < EnumRarity.Epic) {
		const star5Start = "M277.645 296.898"
		svg = svg.replace(
			new RegExp(
				`(<path d="${star5Start}[^"]*" fill=")#FF569F(" stroke="#333333"[^>]*\\/>)`
			),
			`$1#bababa$2`
		)
	}

	// 6. Convert SVG to crisp PNG buffer via root sharp
	const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer()

	return new Response(new Uint8Array(pngBuffer), {
		headers: {
			"Content-Type": "image/png",
			"Cache-Control": "public, max-age=31536000, immutable",
		},
	})
}

export async function generateArcOgImage(arc: Arc): Promise<Response> {
	const templatePath = path.join(
		process.cwd(),
		"public",
		"layout",
		"arc-og.svg"
	)
	let svg = fs.readFileSync(templatePath, "utf8")

	// Inject embedded local fonts into <defs>
	const fontDefs = getEmbeddedFontsDef()
	if (fontDefs) {
		svg = svg.replace("<defs>", `<defs>${fontDefs}`)
	}

	// 1. Weapon Artwork
	const arcImagePath = path.join(process.cwd(), "public", "arcs", arc.imageSrc)
	if (fs.existsSync(arcImagePath)) {
		const arcBuf = await sharp(arcImagePath)
			.resize(630, 630, { fit: "contain" })
			.png()
			.toBuffer()
		const arcDataUrl = `data:image/png;base64,${arcBuf.toString("base64")}`
		svg = svg.replace(
			/<rect id="(?:CHARACTER|ARC) IMAGE"[^>]+>/,
			`<image id="ARC IMAGE" x="530" y="0" width="630" height="630" preserveAspectRatio="xMidYMid meet" xlink:href="${arcDataUrl}" />`
		)
	}

	// 2. Dynamic Name Scaling & Wrapping with Optical Vertical Centering
	const nameLayout = layoutArcName(arc.name, 480, 28, 58)
	svg = svg.replace(
		/<text [^>]*><tspan [^>]*>\{\{NAME\}\}<\/tspan><\/text>/,
		`<text id="{{NAME}}" fill="white" stroke="black" stroke-width="0.18em" stroke-linejoin="round" stroke-linecap="round" paint-order="stroke fill" style="white-space: pre; paint-order: stroke fill; stroke-linejoin: round; stroke-linecap: round;" xml:space="preserve" font-family="Syne" font-size="${nameLayout.fontSize}" font-weight="800" letter-spacing="-0.01em">${nameLayout.tspans}</text>`
	)

	// 3. URL
	svg = svg.replace("{{URL}}", escapeXml(`chiz.pink/arcs/${arc.id}`))

	// 4. Arc Type
	svg = svg.replace(
		"{{ARC_TYPE}}",
		escapeXml(`${arc.type.toUpperCase()} TYPE ARC`)
	)

	// 5. Rarity & Stars
	let rankLabel = "S-RANK"
	if (arc.rarity === EnumRarity.Rare) {
		rankLabel = "A-RANK"
	} else if (arc.rarity <= EnumRarity.Uncommon) {
		rankLabel = "B-RANK"
	}
	svg = svg.replace("{{RANK}}", rankLabel)

	// Dim 5th star if rarity < Epic (5)
	if (arc.rarity < EnumRarity.Epic) {
		const star5Start = "M277.645"
		svg = svg.replace(
			new RegExp(
				`(<path [^>]*d="${star5Start}[^"]*"[^>]*fill=")#FF569F(")`
			),
			`$1#bababa$2`
		)
	}

	// Dim 4th star if rarity < Rare (4)
	if (arc.rarity < EnumRarity.Rare) {
		const star4Start = "M228.195"
		svg = svg.replace(
			new RegExp(
				`(<path [^>]*d="${star4Start}[^"]*"[^>]*fill=")#FF569F(")`
			),
			`$1#bababa$2`
		)
	}

	// 6. Convert SVG to crisp PNG buffer via root sharp
	const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer()

	return new Response(new Uint8Array(pngBuffer), {
		headers: {
			"Content-Type": "image/png",
			"Cache-Control": "public, max-age=31536000, immutable",
		},
	})
}
