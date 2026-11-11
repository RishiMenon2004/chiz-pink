import type { KeyboardEvent, MouseEvent } from "react"

// Handlers that run on both a click and a key press (modals, alerts).
export type KeyMouseEventType = MouseEvent | KeyboardEvent
