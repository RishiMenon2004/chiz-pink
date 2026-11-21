"use client"

import { useSyncExternalStore } from "react"

type Listener = () => void

let hasWriteError = false
let dismissed = false
const listeners = new Set<Listener>()

function emit() {
	listeners.forEach((listener) => listener())
}

// Surfaces a one-time notice per session when local persistence fails.
export function reportStorageWriteError() {
	if (hasWriteError || dismissed) return
	hasWriteError = true
	emit()
}

export function dismissStorageWriteError() {
	if (!hasWriteError && dismissed) return
	hasWriteError = false
	dismissed = true
	emit()
}

function subscribe(listener: Listener) {
	listeners.add(listener)
	return () => listeners.delete(listener)
}

function getSnapshot() {
	return hasWriteError
}

function getServerSnapshot() {
	return false
}

export function useStorageWriteError() {
	return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
