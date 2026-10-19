import { globalPatchEnd, globalPatchStart } from "./event"

export const patchTimings = {
	version1_0: {
		phase1Start: () => globalPatchStart(29, 4, 2026),
		phase1End: () => globalPatchEnd(12, 5, 2026),
		phase2Start: () => globalPatchStart(13, 5, 2026),
		phase2End: () => globalPatchEnd(2, 6, 2026),
	},
	version1_1: {
		phase1Start: () => globalPatchStart(3, 6, 2026),
		phase1End: () => globalPatchEnd(23, 6, 2026),
		phase2Start: () => globalPatchStart(24, 6, 2026),
		phase2End: () => globalPatchEnd(7, 7, 2026),
	},
	version1_2: {
		phase1Start: () => globalPatchStart(8, 7, 2026),
		phase1End: () => globalPatchEnd(28, 7, 2026),
		phase2Start: () => globalPatchStart(29, 7, 2026, -2),
		phase2End: () => globalPatchEnd(18, 8, 2026),
	},
	version1_3: {
		phase1Start: () => globalPatchStart(19, 8, 2026),
		phase1End: () => globalPatchEnd(8, 9, 2026),
		phase2Start: () => globalPatchStart(9, 9, 2026),
		phase2End: () => globalPatchEnd(29, 9, 2026),
	},
	version1_4: {
		phase1Start: () => globalPatchStart(30, 9, 2026),
		phase1End: () => globalPatchEnd(20, 10, 2026),
		phase2Start: () => globalPatchStart(21, 10, 2026),
		phase2End: () => globalPatchEnd(10, 11, 2026),
	},
	version1_5: {
		phase1Start: () => globalPatchStart(11, 11, 2026),
		phase1End: () => globalPatchEnd(1, 12, 2026),
		phase2Start: () => globalPatchStart(2, 12, 2026),
		phase2End: () => globalPatchEnd(22, 12, 2026),
	},
}

export function getPhase1Start(version: keyof typeof patchTimings) {
	return patchTimings[version].phase1Start
}
export function getPhase1End(version: keyof typeof patchTimings) {
	return patchTimings[version].phase1End
}
export function getPhase2Start(version: keyof typeof patchTimings) {
	return patchTimings[version].phase2Start
}
export function getPhase2End(version: keyof typeof patchTimings) {
	return patchTimings[version].phase2End
}
