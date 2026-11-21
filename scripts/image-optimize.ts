import { readFileSync } from "node:fs"

import sharp from "sharp"

export type ImagePresetKey =
	| "characterFull"
	| "characterAvatar"
	| "characterBackground"
	| "arc"
	| "event"

export type ImagePreset = {
	format: "webp" | "png"
	maxWidth: number
	maxHeight: number
	quality?: number
	effort?: number
}

// Target caps match the largest rendered dimensions in src/ components.
export const IMAGE_PRESETS: Record<ImagePresetKey, ImagePreset> = {
	characterFull: {
		format: "webp",
		maxWidth: 1080,
		maxHeight: 1280,
		quality: 82,
		effort: 6,
	},
	characterAvatar: {
		format: "webp",
		maxWidth: 256,
		maxHeight: 256,
		quality: 82,
		effort: 6,
	},
	characterBackground: {
		format: "png",
		maxWidth: 1384,
		maxHeight: 830,
		effort: 10,
	},
	arc: {
		format: "webp",
		maxWidth: 512,
		maxHeight: 512,
		quality: 82,
		effort: 6,
	},
	event: {
		format: "webp",
		maxWidth: 1920,
		maxHeight: 1080,
		quality: 80,
		effort: 6,
	},
}

export type OptimizeResult = {
	buffer: Buffer
	changed: boolean
	beforeBytes: number
	afterBytes: number
	resized: boolean
	converted: boolean
}

const MIN_SAVINGS_RATIO = 0.05

// Resizes and compresses an image buffer to its preset, skipping re-encoding if
// an already-matching file would not shrink meaningfully.
export async function optimizeImageBuffer(
	input: Buffer,
	presetKey: ImagePresetKey,
	options?: { forceEncode?: boolean }
): Promise<OptimizeResult> {
	const preset = IMAGE_PRESETS[presetKey]
	const beforeBytes = input.length
	const meta = await sharp(input).metadata()
	const width = meta.width ?? 0
	const height = meta.height ?? 0
	const sameFormat = meta.format === preset.format
	const needsResize = width > preset.maxWidth || height > preset.maxHeight

	let pipeline = sharp(input)
	if (needsResize) {
		pipeline = pipeline.resize(preset.maxWidth, preset.maxHeight, {
			fit: "inside",
			withoutEnlargement: true,
		})
	}

	const encoded =
		preset.format === "png"
			? await pipeline
					.png({ compressionLevel: 9, effort: preset.effort ?? 10 })
					.toBuffer()
			: await pipeline
					.webp({
						quality: preset.quality ?? 82,
						effort: preset.effort ?? 6,
					})
					.toBuffer()

	const keepOriginal =
		!options?.forceEncode &&
		sameFormat &&
		!needsResize &&
		encoded.length >= beforeBytes * (1 - MIN_SAVINGS_RATIO)

	if (keepOriginal) {
		return {
			buffer: input,
			changed: false,
			beforeBytes,
			afterBytes: beforeBytes,
			resized: false,
			converted: false,
		}
	}

	return {
		buffer: encoded,
		changed: true,
		beforeBytes,
		afterBytes: encoded.length,
		resized: needsResize,
		converted: !sameFormat,
	}
}

export async function optimizeImageFile(
	filePath: string,
	presetKey: ImagePresetKey
) {
	return optimizeImageBuffer(readFileSync(filePath), presetKey)
}

export function formatKb(bytes: number) {
	return `${Math.round(bytes / 1024)} KB`
}
