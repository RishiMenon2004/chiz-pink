export function getPhases(lvl: number) {
	if (lvl > 70) return 6
	if (lvl > 60) return 5
	if (lvl > 50) return 4
	if (lvl > 40) return 3
	if (lvl > 30) return 2
	if (lvl > 20) return 1
	return 0
}
