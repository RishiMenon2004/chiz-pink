import { httpRouter } from "convex/server"

import { httpAction } from "./_generated/server"
import { createDrop } from "./importDropRefs"
import { MAX_CIPHERTEXT_LENGTH } from "./importDrops"

// Allows the exporter's local page. No cookies or auth are involved, and the
// body is already encrypted, so any origin is safe here.
const CORS_HEADERS = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "POST, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type",
}

function respond(status: number, body: object) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { "Content-Type": "application/json", ...CORS_HEADERS },
	})
}

const http = httpRouter()

http.route({
	path: "/import-drop",
	method: "OPTIONS",
	handler: httpAction(async () => {
		return new Response(null, { status: 204, headers: CORS_HEADERS })
	}),
})

http.route({
	path: "/import-drop",
	method: "POST",
	handler: httpAction(async (ctx, request) => {
		const declaredLength = Number(request.headers.get("content-length") ?? 0)
		if (declaredLength > MAX_CIPHERTEXT_LENGTH + 1024) {
			return respond(413, { error: "too_large" })
		}

		let body: unknown
		try {
			body = await request.json()
		} catch {
			return respond(400, { error: "invalid" })
		}

		const { version, ciphertext, iv } = (body ?? {}) as Record<string, unknown>
		if (
			version !== 1 ||
			typeof ciphertext !== "string" ||
			typeof iv !== "string" ||
			iv.length > 32
		) {
			return respond(400, { error: "invalid" })
		}
		if (ciphertext.length > MAX_CIPHERTEXT_LENGTH) {
			return respond(413, { error: "too_large" })
		}

		const dropId = crypto.randomUUID()
		const created = await ctx.runMutation(createDrop, {
			dropId,
			ciphertext,
			iv,
		})
		if (!created) return respond(429, { error: "busy" })

		return respond(201, { dropId, expiresAt: created.expiresAt })
	}),
})

export default http
