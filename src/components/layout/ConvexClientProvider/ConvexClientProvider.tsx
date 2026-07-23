"use client"

import { ReactNode, useCallback } from "react"
import { getSession, useSession } from "next-auth/react"
import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react"

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL as string)

// Convex's generic "bring your own OIDC provider" auth hook, fed by the
// Google id_token next-auth already holds - Convex verifies it directly
// against Google's JWKS (see convex/auth.config.ts), no separate login step.
function useAuthFromNextAuth() {
	const { data: session, status } = useSession()

	const fetchAccessToken = useCallback(
		async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
			// A forced refresh means Convex thinks the current token is stale -
			// re-fetch the session so next-auth's jwt callback gets a chance to
			// refresh an expired Google token before we hand over its id_token.
			if (!forceRefreshToken) return session?.idToken ?? null

			const freshSession = await getSession()
			return freshSession?.idToken ?? null
		},
		[session?.idToken]
	)

	return {
		isLoading: status === "loading",
		isAuthenticated: status === "authenticated" && Boolean(session?.idToken),
		fetchAccessToken,
	}
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
	return (
		<ConvexProviderWithAuth client={convex} useAuth={useAuthFromNextAuth}>
			{children}
		</ConvexProviderWithAuth>
	)
}
