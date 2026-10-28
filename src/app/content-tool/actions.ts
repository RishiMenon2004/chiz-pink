"use server"

// Server functions for the /content-tool dev page. They read and write the
// repo's content-intake folder, so every one refuses to run outside
// `npm run dev` (server functions are reachable by a direct POST).

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"

import type { ContentFile, ContentImageStatus } from "@/types/content"

import { expectedImages, formatContentJson, VERSION_PATTERN } from "@/helpers/contentJson"

const intakeRoot = path.join(process.cwd(), "content-intake")
const publicRoot = path.join(process.cwd(), "public")

function assertDev() {
	if (process.env.NODE_ENV !== "development") throw new Error("The content tool only runs under npm run dev")
}

function versionFolder(version: string) {
	if (!VERSION_PATTERN.test(version)) throw new Error(`"${version}" isn't a version like 1.5`)
	return path.join(intakeRoot, version)
}

export async function listIntakeVersions() {
	assertDev()
	if (!existsSync(intakeRoot)) return []
	return readdirSync(intakeRoot, { withFileTypes: true })
		.filter((entry) => entry.isDirectory() && VERSION_PATTERN.test(entry.name))
		.map((entry) => entry.name)
		.toSorted((a, b) => b.localeCompare(a, undefined, { numeric: true }))
}

export async function loadContent(version: string): Promise<ContentFile | null> {
	assertDev()
	const file = path.join(versionFolder(version), "content.json")
	if (!existsSync(file)) return null
	return JSON.parse(readFileSync(file, "utf8"))
}

export async function saveContent(content: ContentFile) {
	assertDev()
	const folder = versionFolder(content.version)
	const file = path.join(folder, "content.json")

	// Keep the line endings a file already has, so a save that changes
	// nothing doesn't show up in git.
	const existing = existsSync(file) ? readFileSync(file, "utf8") : ""
	const text = formatContentJson(content)
	mkdirSync(folder, { recursive: true })
	writeFileSync(file, existing.includes("\r\n") ? text.replaceAll("\n", "\r\n") : text)

	return path.relative(process.cwd(), file).replaceAll("\\", "/")
}

export async function checkImages(content: ContentFile) {
	assertDev()
	const folder = versionFolder(content.version)
	const intakeFiles = existsSync(folder) ? readdirSync(folder) : []

	const images: ContentImageStatus[] = expectedImages(content).map((image) => ({
		...image,
		status: intakeFiles.includes(image.file)
			? "intake"
			: existsSync(path.join(publicRoot, image.destination))
				? "public"
				: "missing",
	}))

	// Images in the folder that nothing in content.json will pick up,
	// usually a misspelt name.
	const expected = new Set(images.map((image) => image.file))
	const unused = intakeFiles.filter((file) => file !== "content.json" && !expected.has(file))

	return { images, unused }
}
