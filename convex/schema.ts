import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
	// Content fields are optional so a device can be marked unlinked (see
	// unlinkedAt) even with no backup content pushed yet, and so deleteBackup
	// can clear content on unlink while leaving the unlinkedAt marker in
	// place - it used to live in a separate accountStatus table purely so it
	// could outlive a deleted backup row, which this now lets it do in place.
	backups: defineTable({
		userId: v.string(),
		ciphertext: v.optional(v.string()),
		iv: v.optional(v.string()),
		lastUpdated: v.optional(v.number()),
		// Presence means this account was unlinked from some device and every
		// other signed-in device should force a sign-out.
		unlinkedAt: v.optional(v.number()),
	}).index("by_user", ["userId"]),

	// Decoupled gacha pull history. Stored in its own document so routine
	// checklist/inventory/planner updates don't re-upload hundreds of KB of pull logs.
	gachaBackups: defineTable({
		userId: v.string(),
		ciphertext: v.string(),
		iv: v.string(),
		lastUpdated: v.number(),
	}).index("by_user", ["userId"]),
})
