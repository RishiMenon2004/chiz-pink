"use client"

import { useCallback, useSyncExternalStore } from "react"

type ClockChannel = {
	now: number
	listeners: Set<() => void>
	timer: ReturnType<typeof setInterval> | null
}

const DEFAULT_INTERVAL_MS = 1000
const channels = new Map<number, ClockChannel>()

function getChannel(intervalMs: number): ClockChannel {
	let channel = channels.get(intervalMs)
	if (!channel) {
		channel = { now: Date.now(), listeners: new Set(), timer: null }
		channels.set(intervalMs, channel)
	}
	return channel
}

function getServerClockSnapshot(): number | null {
	return null
}

// Shared wall-clock store per interval granularity; returns null on SSR and initial hydration.
export function useNow(intervalMs = DEFAULT_INTERVAL_MS): number | null {
	const subscribe = useCallback(
		(callback: () => void) => {
			const channel = getChannel(intervalMs)
			if (channel.listeners.size === 0) {
				channel.now = Date.now()
			}
			channel.listeners.add(callback)
			if (channel.timer === null) {
				channel.timer = setInterval(() => {
					channel.now = Date.now()
					channel.listeners.forEach((listener) => listener())
				}, intervalMs)
			}

			return () => {
				channel.listeners.delete(callback)
				if (channel.listeners.size === 0 && channel.timer !== null) {
					clearInterval(channel.timer)
					channel.timer = null
				}
			}
		},
		[intervalMs]
	)

	const getSnapshot = useCallback(
		() => getChannel(intervalMs).now,
		[intervalMs]
	)

	return useSyncExternalStore(subscribe, getSnapshot, getServerClockSnapshot)
}
