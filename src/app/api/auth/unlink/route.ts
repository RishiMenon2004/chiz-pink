import { getToken } from "next-auth/jwt"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
	const token = await getToken({ req })
	const revokeTarget = token?.refreshToken ?? token?.accessToken

	if (revokeTarget) {
		const response = await fetch("https://oauth2.googleapis.com/revoke", {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: new URLSearchParams({ token: revokeTarget }),
		})

		// Google returns 400 if the token was already invalid/expired - not fatal, the grant is gone either way.
		if (!response.ok) {
			console.error("Failed to revoke Google token", await response.text())
		}
	}

	return NextResponse.json({ success: true })
}
