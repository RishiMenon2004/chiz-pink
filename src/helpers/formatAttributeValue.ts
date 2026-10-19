// Arc main-attribute values: fractions read as percentages, flat stats as-is.
export function formatAttributeValue(value: number) {
	return value < 1 ? `${+(value * 100).toFixed(2)}%` : `${value}`
}
