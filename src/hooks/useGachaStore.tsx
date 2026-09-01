"use client"

import { useSyncExternalStore } from "react"
import { isInitialSyncPending } from "@/helpers/syncGate"

import { safeParse } from "@/helpers/dataCorruption"
import { MiracleBoxPull, ScarboroughFairPull, PullsRecord } from "@/types/pulls"

let cachedPulls: PullsRecord = {
	arcsBanner: {},
	limitedBanner: {},
	permanentBanner: {},
}
let lastRawValue: string | null = null

export const SERVER_FALLBACK: PullsRecord = {
	arcsBanner: {},
	limitedBanner: {},
	permanentBanner: {},
}

//Add new pulls and skip over existing ones using the timestamp and uid as descriminators
export const gachaPullsActions = {
	addPulls(
		pulls: MiracleBoxPull[] | ScarboroughFairPull[],
		bannerType: keyof PullsRecord
	) {
		const response: {
			status: "pending" | "error" | "success"
			messages: string[]
		} = {
			status: "pending",
			messages: [],
		}

		if (typeof window === "undefined" || isInitialSyncPending())
			return response

		const value = localStorage.getItem("gachaPulls")
		const pullsData = { ...safeParse(value, SERVER_FALLBACK, "gachaPulls") }

		const existingUids = new Set(Object.keys(pullsData[bannerType] || {}))

		const filtedtedPulls = pulls.filter((pull) => !existingUids.has(pull.uid))

		const incomingPullsRecord: Record<
			string,
			MiracleBoxPull | ScarboroughFairPull
		> = {}
		for (const pull of filtedtedPulls) {
			incomingPullsRecord[pull.uid] = pull
		}
		const updatedPulls: PullsRecord = {
			...pullsData,
			[bannerType]: {
				...incomingPullsRecord,
				...pullsData[bannerType],
			},
		}

		try {
			localStorage.setItem("gachaPulls", JSON.stringify(updatedPulls))
			localStorage.setItem("lastUpdated", JSON.stringify(Date.now()))
			window.dispatchEvent(new Event("local-storage-update"))
			response.status = "success"
			const skippedLength = pulls.length - filtedtedPulls.length
			response.messages.push(
				`Imported ${filtedtedPulls.length} pulls.${(skippedLength > 0 && ` (Skipped ${skippedLength} existing pulls.)`) || ""}`
			)
		} catch (err) {
			console.error("Local Storage Error:", err)
			response.status = "error"
			response.messages.push(`Local Storage Error: ${err}`)
		}

		return response
	},
}

const subscribe = (callback: () => void) => {
	window.addEventListener("storage", callback)
	window.addEventListener("local-storage-update", callback)

	return () => {
		window.removeEventListener("storage", callback)
		window.removeEventListener("local-storage-update", callback)
	}
}

const getSnapshot = () => {
	if (typeof window === "undefined") return SERVER_FALLBACK

	const rawValue = localStorage.getItem("gachaPulls")

	if (rawValue !== lastRawValue) {
		cachedPulls = safeParse(rawValue, SERVER_FALLBACK, "gachaPulls")
		lastRawValue = rawValue
	}

	return cachedPulls
}

const getServerSnapshot = () => {
	return SERVER_FALLBACK
}

export function useGachaStore() {
	const gachaPulls = useSyncExternalStore<PullsRecord>(
		subscribe,
		getSnapshot,
		getServerSnapshot
	)

	return {
		gachaPulls,
		actions: {
			addPulls: gachaPullsActions.addPulls,
		},
	}
}
