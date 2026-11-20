"use client"

import { ReactNode, useCallback, useEffect, useState } from "react"
import { getSession, useSession } from "next-auth/react"
import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react"

// Convex's generic "bring your own OIDC provider" auth hook, fed by the
// Google id_token next-auth already holds - Convex verifies it directly
// against Google's JWKS (see convex/auth.config.ts), no separate login step.
function useAuthFromNextAuth() {
	const { data: session, status } = useSession()

	const fetchAccessToken = useCallback(
		async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
			// A forced refresh means Convex thinks the current token is stale,
			// or session has reported an error - re-fetch the session so next-auth's
			// jwt callback gets a chance to refresh an expired Google token.
			if (forceRefreshToken || session?.error === "RefreshAccessTokenError") {
				const freshSession = await getSession()
				if (freshSession?.error === "RefreshAccessTokenError") {
					return null
				}
				return freshSession?.idToken ?? null
			}

			return session?.idToken ?? null
		},
		[session?.idToken, session?.error]
	)

	const hasError = session?.error === "RefreshAccessTokenError"

	return {
		isLoading: status === "loading",
		isAuthenticated:
			status === "authenticated" && Boolean(session?.idToken) && !hasError,
		fetchAccessToken,
	}
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
	const [convex, setConvex] = useState<ConvexReactClient | null>(null)

	useEffect(() => {
		const client = new ConvexReactClient(
			process.env.NEXT_PUBLIC_CONVEX_URL as string
		)
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setConvex(client)
		return () => {
			void client.close()
		}
	}, [])

	if (!convex) return null

	return (
		<ConvexProviderWithAuth client={convex} useAuth={useAuthFromNextAuth}>
			{children}
		</ConvexProviderWithAuth>
	)
}
