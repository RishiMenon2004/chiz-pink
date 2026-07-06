import type { Arc } from "@/types/weapon"

import { marchingBeyondTime, theLastRose, whatsDesired } from "./weapons"

const allArcs: Record<string, Arc> = {
	the_last_rose: theLastRose,
	whats_desired: whatsDesired,
	marching_beyond_time: marchingBeyondTime,
}

export function getAllArcs() {
	return allArcs
}

export function getAllArcsAsArray() {
	return Object.values(allArcs)
}

export function findArc(arcId: string) {
	return allArcs[arcId]
}
