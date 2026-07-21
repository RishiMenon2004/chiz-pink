import type { NextAuthOptions } from "next-auth"
import type { JWT } from "next-auth/jwt"
import GoogleProvider from "next-auth/providers/google"

const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.appdata"

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
					expiresAt: account.expires_at,
				}
			}

			// Existing token that's still valid.
			if (token.expiresAt && Date.now() < token.expiresAt * 1000) {
				return token
			}

			// Expired: refresh it.
			return refreshAccessToken(token)
		},
		async session({ session, token }) {
			session.accessToken = token.accessToken
			session.error = token.error
			return session
		},
	},
}

async function refreshAccessToken(token: JWT): Promise<JWT> {
	try {
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
		}
	} catch (error) {
		console.error("Failed to refresh Google access token", error)
		return { ...token, error: "RefreshAccessTokenError" }
	}
}
