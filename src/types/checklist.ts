export type ChecklistEntry = {
	checked: number
	claimed: number
	claimedAt: number | null
}

export type ChecklistRecord = {
	activities: Record<string, Record<string, ChecklistEntry>>
	events: Record<string, number>
	lastDailyReset: number
}
