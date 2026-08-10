"use client"

import {
	KeyboardEvent,
	MouseEvent,
	PointerEvent,
	ReactNode,
	useEffect,
	useRef,
} from "react"

export type KeyMouseEventType = MouseEvent | KeyboardEvent

type ModalContainerType = {
	onClickOut?: (e: KeyMouseEventType) => void
	children: ReactNode
}

function isTextInputElement(el: Element | null): el is HTMLElement {
	if (!el) return false
	if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") return true
	return (el as HTMLElement).isContentEditable
}

export function ModalContainer({ onClickOut, children }: ModalContainerType) {
	// On touchscreens, the first tap outside should just dismiss the
	// on-screen keyboard; only a second tap (once no input is focused)
	// should trigger onClickOut. Real mice never have a keyboard to hide,
	// so they're left out of this entirely and always close on one click.
	const suppressNextClickRef = useRef(false)

	useEffect(() => {
		const handleGlobalKeyDown = (e: globalThis.KeyboardEvent) => {
			if (e.key === "Escape" && onClickOut) {
				onClickOut(e as unknown as KeyboardEvent<HTMLElement>)
			}
		}

		window.addEventListener("keydown", handleGlobalKeyDown)
		return () => window.removeEventListener("keydown", handleGlobalKeyDown)
	}, [onClickOut])

	const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
		const isTouchLike = e.pointerType === "touch" || e.pointerType === "pen"
		if (!isTouchLike) {
			suppressNextClickRef.current = false
			return
		}

		const active = document.activeElement
		if (isTextInputElement(active)) {
			// Best-effort: on browsers that honor it, this stops the
			// following click from ever being synthesized at all.
			e.preventDefault()
			active.blur()
			suppressNextClickRef.current = true
		} else {
			suppressNextClickRef.current = false
		}
	}

	const handleClick = (e: MouseEvent) => {
		if (suppressNextClickRef.current) {
			suppressNextClickRef.current = false
			return
		}
		onClickOut?.(e)
	}

	return (
		<div
			className="modal-container no-body-scroll"
			onPointerDown={onClickOut ? handlePointerDown : undefined}
			onClick={onClickOut ? handleClick : undefined}>
			{children}

			{onClickOut && (
				<p
					style={{
						position: "fixed",
						bottom: "5%",
						color: "white",
						opacity: "0.5",
						fontWeight: "700",
					}}>
					Click the empty space to exit
				</p>
			)}
		</div>
	)
}
