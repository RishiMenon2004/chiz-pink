export const createSearchString = <T>(item: T, keys: Array<keyof T>): string => {
	return keys
		.map((key) => {
			const value = item[key]
			if (typeof value !== "string") return ""

			return value.replace(/[_\s]/g, "").toLowerCase()
		})
		.join("")
}
