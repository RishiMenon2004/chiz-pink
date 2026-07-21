import type { Metadata } from "next"

export const metadata: Metadata = {
	title: "You're Offline",
}

export default function OfflinePage() {
	return (
		<div className="page" style={{ display: "grid", placeItems: "center" }}>
			<span
				style={{
					display: "grid",
					alignItems: "center",
					justifyItems: "center",
					gap: "0.5rem",
					color: "white",
					textAlign: "center",
					padding: "2rem",
				}}>
				<p style={{ fontSize: "1.5rem", fontWeight: 700 }}>
					{"Eek! Y-You're offline!"}
				</p>
				<p style={{ color: "var(--white)" }}>
					{
						"You should be able to see p-pages that you've a-already visited."
					}
				</p>
			</span>
		</div>
	)
}
