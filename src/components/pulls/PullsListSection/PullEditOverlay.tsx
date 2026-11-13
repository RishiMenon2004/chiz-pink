"use client"

import {
	CSSProperties,
	ReactNode,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react"
import { createPortal } from "react-dom"

import type { Pull } from "@/types/pulls"

import { PullEditor, type PreviewSlots } from "../ManualPullEntry"

import styles from "./pullsListSection.module.css"

// Room kept between the lifted pull and the window's edges.
const EDGE = 16

// Editing a pull in place: the page blurs, the pull lifts out of the list
// where it sits, and becomes the editor - its dice, name and pity turn into
// controls, with the rest in a box under it. `renderRow` draws the pull's
// row (as edited so far); `anchor` is the original row's element.
export function PullEditOverlay({
	pull,
	shownPity,
	anchor,
	renderRow,
	onClose,
}: {
	pull: Pull
	shownPity: number
	anchor: HTMLElement
	renderRow: (draft: Pull, pity: number, slots: PreviewSlots) => ReactNode
	onClose: () => void
}) {
	const stackRef = useRef<HTMLDivElement>(null)
	const [place] = useState(() => {
		// The row spans its number cell through to the pity column.
		const numberCell = anchor.previousElementSibling as HTMLElement | null
		const rect = anchor.getBoundingClientRect()
		const left = numberCell?.getBoundingClientRect().left ?? rect.left
		const list = anchor.closest(`.${styles.pullsList}`)
		return {
			top: rect.top,
			left,
			width: rect.right - left,
			// The number cell's width, before the pull itself starts.
			lead: rect.left - left,
			columns: list ? getComputedStyle(list).gridTemplateColumns : undefined,
		}
	})
	const [top, setTop] = useState(place.top)

	// Moves up just enough for the editor to fit on screen.
	useLayoutEffect(() => {
		const height = stackRef.current?.offsetHeight ?? 0
		const overflow = place.top + height - (window.innerHeight - EDGE)
		if (overflow > 0) setTop(Math.max(EDGE, place.top - overflow))
	}, [place.top])

	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose()
		}
		window.addEventListener("keydown", onKeyDown)
		return () => window.removeEventListener("keydown", onKeyDown)
	}, [onClose])

	return createPortal(
		<>
			<div className={`no-body-scroll ${styles.liftBackdrop}`} onClick={onClose} />
			<div
				ref={stackRef}
				className={styles.liftStack}
				style={
					{
						top,
						left: place.left,
						width: place.width,
						"--lead": `${place.lead}px`,
					} as CSSProperties
				}>
				<PullEditor
					pull={pull}
					shownPity={shownPity}
					onClose={onClose}
					renderPreview={(draft, pity, slots) => (
						<div className={styles.liftRow} style={{ gridTemplateColumns: place.columns }}>
							{renderRow(draft, pity, slots)}
						</div>
					)}
				/>
			</div>
		</>,
		document.body
	)
}
