"use client"

import { useEffect } from "react"
import { getSession } from "next-auth/react"

import styles from "./popupCallback.module.css"

export default function PopupCallbackPage() {
	useEffect(() => {
		// getSession() broadcasts a "session" event (via localStorage + the
		// storage event) that the opener's SessionProvider is listening for.
		// Must resolve before closing, or the popup vanishes before the
		// broadcast ever goes out and the opener never finds out we signed in.
		getSession().finally(() => window.close())
	}, [])

	return (
		<main
			className={`page ${styles.popupMain}`}
			role="main">
			<div className={styles.popupBanner}>
				<h2 className={styles.popupHeading}>
					{"Signed in with Google"}
				</h2>
				<p>{"You may now close this window."}</p>
			</div>
		</main>
	)
}
