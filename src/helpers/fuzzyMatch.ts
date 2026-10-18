// Lightweight fuzzy matcher for short item names (no dependency needed).
//
// A query matches when its characters appear in the target in order
// ("blmrg" → "Blushing Mirage"). Matches are scored so the most natural
// hits sort first: consecutive runs, word starts and an early first hit
// score higher. Queries of 4+ characters that don't match as a
// subsequence still match with one typo (a substitution, insertion,
// deletion or swap) against any word or the whole target, at a low score.
//
// Returns null for no match, otherwise a score (higher is better).

const normalise = (text: string) =>
	text
		.toLowerCase()
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "")
		.replace(/[^a-z0-9 ]/g, "")

function subsequenceScore(query: string, target: string): number | null {
	let score = 0
	let targetIndex = 0
	let previousMatch = -2

	for (const char of query) {
		const found = target.indexOf(char, targetIndex)
		if (found === -1) return null

		score += 1
		if (found === previousMatch + 1) score += 3 // consecutive run
		if (found === 0 || target[found - 1] === " ") score += 2 // word start

		previousMatch = found
		targetIndex = found + 1
	}

	// Prefer hits that start early and targets close to the query's length.
	const firstHit = target.indexOf(query[0])
	return score - firstHit * 0.1 - (target.length - query.length) * 0.01
}

// Optimal string alignment distance, capped: returns early once it's
// clear the distance exceeds `max`.
function editDistance(a: string, b: string, max: number): number {
	if (Math.abs(a.length - b.length) > max) return max + 1

	let prevPrev: number[] = []
	let prev = Array.from({ length: b.length + 1 }, (_, i) => i)

	for (let i = 1; i <= a.length; i++) {
		const current = [i]
		let rowMin = i

		for (let j = 1; j <= b.length; j++) {
			const cost = a[i - 1] === b[j - 1] ? 0 : 1
			let value = Math.min(prev[j] + 1, current[j - 1] + 1, prev[j - 1] + cost)
			if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
				value = Math.min(value, prevPrev[j - 2] + 1)
			}
			current.push(value)
			rowMin = Math.min(rowMin, value)
		}

		if (rowMin > max) return max + 1
		prevPrev = prev
		prev = current
	}

	return prev[b.length]
}

export function fuzzyScore(rawQuery: string, rawTarget: string): number | null {
	const query = normalise(rawQuery).replaceAll(" ", "")
	if (!query) return 0

	const target = normalise(rawTarget)

	const subsequence = subsequenceScore(query, target)
	if (subsequence !== null) return subsequence

	if (query.length < 4) return null

	const candidates = [target.replaceAll(" ", ""), ...target.split(" ")]
	for (const candidate of candidates) {
		// Compare against the candidate's prefix too, so a typo while still
		// typing ("mirgae" → "mirage...") counts.
		const prefix = candidate.slice(0, query.length)
		if (editDistance(query, candidate, 1) <= 1 || editDistance(query, prefix, 1) <= 1) {
			return 0.5
		}
	}

	return null
}

// Best score across several fields (e.g. name and id), or null if none
// match.
export function fuzzyScoreAny(query: string, fields: string[]): number | null {
	let best: number | null = null
	for (const field of fields) {
		const score = fuzzyScore(query, field)
		if (score !== null && (best === null || score > best)) best = score
	}
	return best
}
