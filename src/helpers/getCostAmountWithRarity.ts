export function getCostAmount(value: number | number[], rarity: number): number {
	const index = Number(rarity) - 3
	return Array.isArray(value) ? (value[index] ?? 0) : value
}
