"use client"

import { ReactNode } from "react"

import type { ToolIntroId } from "@/helpers/toolIntro"

import { useToolIntro } from "@/hooks/useToolIntro"

import { InfoBox } from "../InfoBox"

// A short "what this tool is" box for first-time visitors. It's always in
// the server HTML (hidden), so search engines have something to read on
// pages that are otherwise just the user's own data, and it only shows
// once storage confirms this is a new browser. Closes for good on the X
// or on the tool's first real use (see dismissToolIntro's callers).
export function ToolIntro({
	id,
	children,
}: {
	id: ToolIntroId
	children: ReactNode
}) {
	const { show, dismiss } = useToolIntro(id)

	return (
		<InfoBox hidden={!show} onDismiss={dismiss}>
			{children}
		</InfoBox>
	)
}
