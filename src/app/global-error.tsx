"use client"

import { useEffect } from "react"

import { isChunkLoadError, reloadAfterChunkError } from "@/helpers/chunkLoadError"

export default function GlobalError({
	error,
	unstable_retry,
}: {
	error: Error & { digest?: string }
	unstable_retry: () => void
}) {
	const chunkError = isChunkLoadError(error)

	useEffect(() => {
		if (chunkError) reloadAfterChunkError()
	}, [chunkError])

	return (
		<html lang="en">
			<body
				style={{
					backgroundColor: "#1d1d1d",
					color: "#ffffff",
					fontFamily: "system-ui, sans-serif",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					minHeight: "100dvh",
					padding: "2rem",
					textAlign: "center",
					gap: "1rem",
				}}>
				<h2 style={{ fontSize: "1.5rem" }}>
					{"Oh no! Something has gone horribly wrong :("}
				</h2>
				<p style={{ opacity: 0.7, maxWidth: "500px" }}>{error.message}</p>
				<button
					onClick={() =>
						chunkError ? window.location.reload() : unstable_retry()
					}
					style={{
						padding: "0.35rem 1.5rem",
						border: "none",
						borderRadius: "1rem",
						backgroundColor: "#ff569f",
						color: "white",
						fontSize: "1.1rem",
						fontWeight: 700,
						cursor: "pointer",
					}}>
					TRY AGAIN
				</button>
			</body>
		</html>
	)
}
