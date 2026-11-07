import { FunctionReference, makeFunctionReference } from "convex/server"

// Named references instead of `internal` from _generated/api: that file imports
// the type of every Convex module, so using it here would form an import cycle.
// These strings aren't type-checked against importDrops.ts, so keep them in step.
export const createDrop = makeFunctionReference(
	"importDrops:create"
) as unknown as FunctionReference<
	"mutation",
	"internal",
	{ dropId: string; ciphertext: string; iv: string },
	{ expiresAt: number } | null
>

export const deleteExpiredDrops = makeFunctionReference(
	"importDrops:deleteExpired"
) as unknown as FunctionReference<"mutation", "internal", Record<string, never>>
