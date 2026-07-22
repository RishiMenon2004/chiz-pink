import { BackupData } from "@/types/settings"

const LAST_SYNCED_KEY = "lastSynced"

// Marks that this device has completed at least one Drive sync exchange
// (push or pull). Once set, a newer remote timestamp is trusted outright
// instead of prompting to overwrite. Deliberately not set by manual JSON
// file import - that's a separate, one-off action from Drive sync.
export function markSynced() {
	window.localStorage.setItem(LAST_SYNCED_KEY, String(Date.now()))
}

function getFormattedDate(date = new Date()) {
	const yyyy = date.getFullYear()
	const MM = String(date.getMonth() + 1).padStart(2, "0") // Months are 0-indexed
	const DD = String(date.getDate()).padStart(2, "0")
	const hh = String(date.getHours()).padStart(2, "0")
	const mm = String(date.getMinutes()).padStart(2, "0")
	const ss = String(date.getSeconds()).padStart(2, "0")

	return `${yyyy}_${MM}_${DD}_${hh}_${mm}_${ss}`
}

export function buildBackupPayload() {
	const plannerData =
		window.localStorage.getItem("planner") ??
		'{ "arcs": {}, "characters": {} }'
	const inventoryData = window.localStorage.getItem("inventory") ?? "{}"
	const settingsData =
		window.localStorage.getItem("settings") ?? "{ appearance: {} }"
	const lastUpdated = window.localStorage.getItem("lastUpdated") ?? Date.now()

	return {
		lastUpdated,
		inventory: JSON.parse(inventoryData),
		planner: JSON.parse(plannerData),
		settings: JSON.parse(settingsData),
	}
}

export function backupExport() {
	const exportJson = JSON.stringify(buildBackupPayload())

	const blob = new Blob([exportJson], { type: "application/json" })
	const url = window.URL.createObjectURL(blob)
	const link = window.document.createElement("a")
	const currentDate = getFormattedDate(new Date(Date.now()))

	link.href = url
	link.download = `chiz-pink.data_backup_${currentDate}.json`
	link.click()

	window.URL.revokeObjectURL(url)
}

export function backupImport(json: string) {
	let data = {} as BackupData

	try {
		data = JSON.parse(json) satisfies BackupData
	} catch (error) {
		data = null!
		console.error(error)
	}

	if (data === null) {
		return {
			status: "error",
			data: {} as BackupData,
		}
	}

	const lastUpdated = Number(window.localStorage.getItem("lastUpdated"))
	const plannerData = window.localStorage.getItem("planner")
	const inventoryData = window.localStorage.getItem("inventory")
	const settingsData = window.localStorage.getItem("settings")
	const remoteLastUpdated = Number(data.lastUpdated)
	const hasSyncedBefore = Boolean(window.localStorage.getItem(LAST_SYNCED_KEY))

	if (lastUpdated && remoteLastUpdated === lastUpdated) {
		return { status: "synced", data }
	}

	if (lastUpdated && remoteLastUpdated < lastUpdated) {
		return { status: "older", data }
	}

	if (remoteLastUpdated > Date.now()) {
		return { status: "future", data } //WOW!
	}

	if (!hasSyncedBefore && (plannerData || inventoryData || settingsData)) {
		return { status: "overwrite", data }
	}

	return { status: "newer", data }
}

const ERASABLE_KEYS = [
	"inventory",
	"planner",
	"settings",
	"lastUpdated",
	"lastSeen",
]

export function eraseLocalData() {
	for (const key of ERASABLE_KEYS) {
		window.localStorage.removeItem(key)
	}
	window.dispatchEvent(new Event("local-storage-update"))
}

export function backupSetImport({
	lastUpdated,
	planner,
	inventory,
	settings,
}: BackupData) {
	window.localStorage.setItem("inventory", JSON.stringify(inventory))
	window.localStorage.setItem("planner", JSON.stringify(planner))
	window.localStorage.setItem("lastUpdated", String(lastUpdated))
	window.localStorage.setItem("settings", JSON.stringify(settings))
	window.dispatchEvent(new Event("local-storage-update"))
}
