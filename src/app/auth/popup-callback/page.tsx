"use client"

import { useEffect } from "react"
import { getSession } from "next-auth/react"

export default function PopupCallbackPage() {
	useEffect(() => {
		// getSession() broadcasts a "session" event (via localStorage + the
		// storage event) that the opener's SessionProvider is listening for.
		// Must resolve before closing, or the popup vanishes before the
		// broadcast ever goes out and the opener never finds out we signed in.
		getSession().finally(() => window.close())
	}, [])

	return (
		<div
			className="page"
			style={{
				display: "flex",
				flexDirection: "column",
				fontSize: "1.125rem",
				paddingInline: 0,
			}}>
			<div
				style={{
					gap: "1rem",
					backgroundColor: "#00000033",
					paddingBlock: "2rem",
					paddingInline: "6rem",
				}}>
				<h2
					style={{
						marginBlockEnd: "1rem",
					}}>
					{"Signed in with Google"}
				</h2>
				<p>{"You may now close this window."}</p>
			</div>
		</div>
	)
}
