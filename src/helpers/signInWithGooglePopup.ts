import { getCsrfToken, signIn } from "next-auth/react"

const POPUP_WIDTH = 500
const POPUP_HEIGHT = 650

export async function signInWithGooglePopup() {
	const left = window.screenX + (window.outerWidth - POPUP_WIDTH) / 2
	const top = window.screenY + (window.outerHeight - POPUP_HEIGHT) / 2

	// Must be opened synchronously in response to the click, or browsers block it.
	const popup = window.open(
		"about:blank",
		"google-signin",
		`width=${POPUP_WIDTH},height=${POPUP_HEIGHT},left=${left},top=${top}`
	)

	if (!popup) {
		// Popup blocked - fall back to a normal full-page redirect.
		signIn("google")
		return
	}

	const callbackUrl = `${window.location.origin}/auth/popup-callback`

	// Mirrors what next-auth's own signIn() does internally, just targeting
	// the popup instead of window.location for the final navigation.
	const response = await fetch("/api/auth/signin/google", {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: new URLSearchParams({
			csrfToken: (await getCsrfToken()) ?? "",
			callbackUrl,
			json: "true",
		}),
	})

	const data = (await response.json()) as { url?: string }

	if (data.url) {
		popup.location.href = data.url
	} else {
		popup.close()
	}
}
