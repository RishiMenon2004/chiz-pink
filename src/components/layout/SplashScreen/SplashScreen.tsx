"use client"

import { useFirstVisit } from "@/hooks/useFirstVisit"
import { useLastSeen } from "@/hooks/useLastSeen"

export function SplashScreen() {
	const { isFirstVisit } = useFirstVisit()
	const isLastSeenOld = useLastSeen()
	return <div>{isFirstVisit ? "first time" : "not first time"}</div>
}
