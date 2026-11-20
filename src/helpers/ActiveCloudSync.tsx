"use client"

import type { CloudSyncContextValue } from "@/contexts"

import { ConvexClientProvider } from "@/components/layout/ConvexClientProvider"

import { CloudSyncProvider } from "./CloudSyncProvider"

// Loaded dynamically only once signed in, keeping Convex out of signed-out loads.
export function ActiveCloudSync({
	onStateChange,
}: {
	onStateChange: (value: CloudSyncContextValue | null) => void
}) {
	return (
		<ConvexClientProvider>
			<CloudSyncProvider onStateChange={onStateChange} />
		</ConvexClientProvider>
	)
}
