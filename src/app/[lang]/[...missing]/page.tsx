import { notFound } from "next/navigation"

// Unknown URLs land here (src/proxy.ts rewrites /foo to /en/foo), so the 404
// renders inside the [lang] layout with the sidebar, like it did before the
// move. Without this, Next falls back to its bare default 404 page, since
// there's no root layout above [lang].
export default function MissingPage() {
	notFound()
}
