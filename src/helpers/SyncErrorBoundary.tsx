"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"

interface SyncErrorBoundaryProps {
	children: ReactNode
	onError: () => void
}

interface SyncErrorBoundaryState {
	hasError: boolean
}

// Isolates cloud sync crashes so the rest of the app never remounts.
export class SyncErrorBoundary extends Component<
	SyncErrorBoundaryProps,
	SyncErrorBoundaryState
> {
	constructor(props: SyncErrorBoundaryProps) {
		super(props)
		this.state = { hasError: false }
	}

	static getDerivedStateFromError(): SyncErrorBoundaryState {
		return { hasError: true }
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error(
			"CloudSyncProvider caught an error in SyncErrorBoundary:",
			error,
			errorInfo
		)
		this.props.onError()
	}

	render() {
		if (this.state.hasError) return null
		return this.props.children
	}
}
