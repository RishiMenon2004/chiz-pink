"use client"

import { Analytics } from "@vercel/analytics/next"

// Analytics loads before /pulls/import-external can remove the decryption key
// from the URL, so the # part must never be reported.
export function SiteAnalytics() {
	return (
		<Analytics
			beforeSend={(event) => ({ ...event, url: event.url.split("#")[0] })}
		/>
	)
}
