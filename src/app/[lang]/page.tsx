import { Metadata } from "next"

import { buildRouteMetadata, SITE_NAME, SITE_URL } from "@/helpers/metadata"
import { PageMessages } from "@/helpers/PageMessages"

import { RenderHome } from "./RenderHome"

type Props = {
	params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	return buildRouteMetadata("/", (await params).lang)
}

// Google takes the site name shown above search results from this, and
// falls back to the bare domain ("chiz.pink") without it. Only read on the
// home page.
const websiteJsonLd = {
	"@context": "https://schema.org",
	"@type": "WebSite",
	name: SITE_NAME,
	url: `${SITE_URL}/`,
}

export default async function Home({ params }: Props) {
	const { lang } = await params

	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(websiteJsonLd).replace(/</g, "\\u003c"),
				}}
			/>
			<PageMessages lang={lang} namespaces={["home", "planner"]}>
				<RenderHome />
			</PageMessages>
		</>
	)
}
