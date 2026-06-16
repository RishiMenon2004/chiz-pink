"use client"

export type Inventory = Record<string, number>

export default function getInventory() {
	const inventory = JSON.parse(localStorage?.getItem("inventory") || "{}")

	function updateInventory(newInventory: Inventory) {
		const value = localStorage.getItem("inventory")
		let jsonInventory = JSON.parse(value || "{}")
		jsonInventory = { ...jsonInventory, ...newInventory }
		try {
			localStorage.setItem("inventory", JSON.stringify(jsonInventory))
		} catch (err) {
			console.error("Local Storage Error:", err);
		}
	}

	return { inventory, updateInventory }
}