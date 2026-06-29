import { Arc } from "./arc"
import { marchingBeyondTime } from "./marching_beyond_time"
import { theLastRose } from "./the_last_rose"
import { whatsDesired } from "./whats_desired"

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
