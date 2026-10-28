// Serves an image from a content-intake folder so the /content-tool dev page
// can preview it before content:add copies it into public/. Dev only.

import { existsSync, readFileSync } from "node:fs"
import path from "node:path"

import type { NextRequest } from "next/server"

import { VERSION_PATTERN } from "@/helpers/contentJson"

const TYPES: Record<string, string> = { ".webp": "image/webp", ".png": "image/png" }

export function GET(request: NextRequest) {
	if (process.env.NODE_ENV !== "development") return new Response(null, { status: 404 })

	const version = request.nextUrl.searchParams.get("version") ?? ""
	const file = request.nextUrl.searchParams.get("file") ?? ""
	const type = TYPES[path.extname(file)]

	// A bare file name only, so the request can't leave the version folder.
	if (!VERSION_PATTERN.test(version) || !type || path.basename(file) !== file) {
		return new Response(null, { status: 400 })
	}

	const source = path.join(process.cwd(), "content-intake", version, file)
	if (!existsSync(source)) return new Response(null, { status: 404 })

	return new Response(readFileSync(source), {
		headers: { "Content-Type": type, "Cache-Control": "no-store" },
	})
}
