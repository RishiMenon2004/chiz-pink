import type { NextAuthOptions } from "next-auth"
import type { JWT } from "next-auth/jwt"
import GoogleProvider from "next-auth/providers/google"

const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.appdata"
// Refresh 5 minutes before actual token expiration to prevent stale token race conditions
const REFRESH_BUFFER_SECONDS = 300

export const authOptions: NextAuthOptions = {
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
			authorization: {
				params: {
					scope: `openid email profile ${DRIVE_SCOPE}`,
					access_type: "offline",
					prompt: "consent",
				},
			},
		}),
	],
	callbacks: {
		async jwt({ token, account }) {
			// Initial sign-in: persist the tokens Google just issued.
			if (account) {
				return {
					...token,
					accessToken: account.access_token,
					refreshToken: account.refresh_token,
					idToken: account.id_token,
					expiresAt: account.expires_at,
				}
			}

			// Token is still comfortably valid (outside the 5-minute pre-expiry window)
			if (
				token.expiresAt &&
				Date.now() < (token.expiresAt - REFRESH_BUFFER_SECONDS) * 1000
			) {
				return token
			}

			// Expired or close to expiry: refresh it proactively
			return refreshAccessToken(token)
		},
		async session({ session, token }) {
			session.accessToken = token.accessToken
			session.idToken = token.idToken
			session.error = token.error
			return session
		},
	},
}

async function refreshAccessToken(token: JWT): Promise<JWT> {
	try {
		if (!token.refreshToken) {
			throw new Error("No refresh token available")
		}

		const response = await fetch("https://oauth2.googleapis.com/token", {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: new URLSearchParams({
				client_id: process.env.GOOGLE_CLIENT_ID as string,
				client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
				grant_type: "refresh_token",
				refresh_token: token.refreshToken as string,
			}),
		})

		const refreshed = await response.json()

		if (!response.ok) throw refreshed

		return {
			...token,
			accessToken: refreshed.access_token,
			expiresAt: Math.floor(Date.now() / 1000) + refreshed.expires_in,
			// Google only returns a new refresh token occasionally; keep the old one otherwise.
			refreshToken: refreshed.refresh_token ?? token.refreshToken,
			// Same deal for the id token - not always reissued on refresh.
			idToken: refreshed.id_token ?? token.idToken,
			error: undefined,
		}
	} catch (error) {
		console.error("Failed to refresh Google access token", error)
		return { ...token, error: "RefreshAccessTokenError" }
	}
}
