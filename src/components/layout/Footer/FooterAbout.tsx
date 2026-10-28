"use client"

import { ReactNode, useEffect, useRef } from "react"

// Closest the panel gets to the edge of the screen.
const SCREEN_MARGIN = 8

// The panel sits above the whole footer column (CSS), so it clears both
// lines; this centres it on the toggle horizontally, kept on screen.
function placePanel(details: HTMLDetailsElement) {
	const summary = details.querySelector("summary")
	const panel = details.lastElementChild
	if (!summary || !(panel instanceof HTMLElement)) return
	const container = panel.offsetParent
	if (!container) return

	const toggle = summary.getBoundingClientRect()
	const width = panel.offsetWidth
	const centred = toggle.left + toggle.width / 2 - width / 2
	const left = Math.min(
		Math.max(centred, SCREEN_MARGIN),
		window.innerWidth - SCREEN_MARGIN - width
	)

	panel.style.left = `${left - container.getBoundingClientRect().left}px`
	panel.style.translate = "none"
}

/**
 * A <details> that also closes on a click outside it or on Escape. Still
 * server-rendered, so its text is in the HTML whether it's open or not.
 */
export function FooterAbout({
	className,
	children,
}: {
	className?: string
	children: ReactNode
}) {
	const ref = useRef<HTMLDetailsElement>(null)

	useEffect(() => {
		const details = ref.current
		const summary = details?.querySelector("summary")
		if (!details || !summary) return

		// Opened here rather than natively, so the panel is placed before
		// it's first painted instead of jumping into place.
		const handleToggle = (e: MouseEvent) => {
			e.preventDefault()
			details.open = !details.open
			if (details.open) placePanel(details)
		}
		const handlePointerDown = (e: PointerEvent) => {
			if (details.open && !details.contains(e.target as Node)) {
				details.open = false
			}
		}
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") details.open = false
		}
		const handleResize = () => {
			if (details.open) placePanel(details)
		}

		summary.addEventListener("click", handleToggle)
		document.addEventListener("pointerdown", handlePointerDown)
		document.addEventListener("keydown", handleKeyDown)
		window.addEventListener("resize", handleResize)
		return () => {
			summary.removeEventListener("click", handleToggle)
			document.removeEventListener("pointerdown", handlePointerDown)
			document.removeEventListener("keydown", handleKeyDown)
			window.removeEventListener("resize", handleResize)
		}
	}, [])

	return (
		<details ref={ref} className={className}>
			{children}
		</details>
	)
}
