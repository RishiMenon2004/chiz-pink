import { NextResponse, type NextRequest } from "next/server"

import { NEW_ORIGIN } from "@/helpers/domainMigration"
import { buildNteWizConsoleScript } from "@/helpers/nteWizMigration"

export function GET(request: NextRequest) {
	const host = request.nextUrl.hostname
	const targetOrigin =
		host === "localhost" || host === "127.0.0.1"
			? request.nextUrl.origin
			: NEW_ORIGIN

	const script = buildNteWizConsoleScript(targetOrigin)

	return new NextResponse(script, {
		status: 200,
		headers: {
			"Content-Type": "application/javascript; charset=utf-8",
			"Cache-Control": "no-cache, no-store, must-revalidate",
			"X-Content-Type-Options": "nosniff",
		},
	})
}
