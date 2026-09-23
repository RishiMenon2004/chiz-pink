"use client"

import React, { Component, type ErrorInfo, type ReactNode } from "react"
import { CloudSyncContext } from "@/contexts"

interface SyncErrorBoundaryProps {
	children: ReactNode
}

interface SyncErrorBoundaryState {
	hasError: boolean
	error: Error | null
}

const FALLBACK_SYNC_CONTEXT = {
	status: "error" as const,
	lastSyncedAt: null,
	latestBackupUpdatedAt: null,
	syncNow: () => {
		console.warn("Cloud sync is unavailable due to an error.")
	},
}

export class SyncErrorBoundary extends Component<
	SyncErrorBoundaryProps,
	SyncErrorBoundaryState
> {
	constructor(props: SyncErrorBoundaryProps) {
		super(props)
		this.state = { hasError: false, error: null }
	}

	static getDerivedStateFromError(error: Error): SyncErrorBoundaryState {
		return { hasError: true, error }
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error("CloudSyncProvider caught an error in SyncErrorBoundary:", error, errorInfo)
	}

	render() {
		if (this.state.hasError) {
			// Provide fallback context so downstream components using useCloudSyncContext()
			// (e.g. Settings, Header) continue rendering smoothly without crashing the page.
			return (
				<CloudSyncContext.Provider value={FALLBACK_SYNC_CONTEXT}>
					{this.props.children}
				</CloudSyncContext.Provider>
			)
		}

		return this.props.children
	}
}
