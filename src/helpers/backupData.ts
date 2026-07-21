import { Inventory } from "@/types/inventory"
import { PlannerRecord } from "@/types/planner"

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
	const lastUpdated = window.localStorage.getItem("lastUpdated") ?? Date.now()

	return {
		lastUpdated,
		inventory: JSON.parse(inventoryData),
		planner: JSON.parse(plannerData),
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
	let data = {} as {
		lastUpdated: number
		inventory: Inventory
		planner: PlannerRecord
	}

	try {
		data = JSON.parse(json) as {
			lastUpdated: number
			inventory: Inventory
			planner: PlannerRecord
		}
	} catch (error) {
		data = null!
		console.error(error)
	}

	if (data === null) {
		return {
			status: "error",
			data: {} as {
				lastUpdated: number
				inventory: Inventory
				planner: PlannerRecord
			},
		}
	}

	const lastUpdated = Number(window.localStorage.getItem("lastUpdated"))
	const plannerData = window.localStorage.getItem("planner")
	const inventoryData = window.localStorage.getItem("inventory")
	const remoteLastUpdated = Number(data.lastUpdated)

	if (lastUpdated && remoteLastUpdated === lastUpdated) {
		return { status: "synced", data }
	}

	if (lastUpdated && remoteLastUpdated < lastUpdated) {
		return { status: "older", data }
	}

	if (remoteLastUpdated > Date.now()) {
		return { status: "future", data } //WOW!
	}

	if (plannerData || inventoryData) {
		return { status: "overwrite", data }
	}

	return { status: "newer", data }
}

export function backupSetImport({
	planner,
	inventory,
}: {
	planner: PlannerRecord
	inventory: Inventory
	lastUpdated: number
}) {
	window.localStorage.setItem("inventory", JSON.stringify(inventory))
	window.localStorage.setItem("planner", JSON.stringify(planner))
	window.localStorage.setItem("lastUpdated", JSON.stringify(Date.now()))
	window.dispatchEvent(new Event("local-storage-update"))
}
