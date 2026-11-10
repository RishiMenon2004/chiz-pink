import { Metadata } from "next"

import { buildRouteMetadata, SITE_NAME, SITE_URL } from "@/helpers/metadata"

import { RenderHome } from "./RenderHome"

export const metadata: Metadata = buildRouteMetadata("/")

// Google takes the site name shown above search results from this, and
// falls back to the bare domain ("chiz.pink") without it. Only read on the
// home page.
const websiteJsonLd = {
	"@context": "https://schema.org",
	"@type": "WebSite",
	name: SITE_NAME,
	url: `${SITE_URL}/`,
}

export default function Home() {
	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(websiteJsonLd).replace(/</g, "\\u003c"),
				}}
			/>
			<RenderHome/>
		</>
	)
}
