import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
	backups: defineTable({
		userId: v.string(),
		ciphertext: v.string(),
		iv: v.string(),
		lastUpdated: v.number(),
	}).index("by_user", ["userId"]),

	// Presence of a row here means this account was unlinked from some
	// device and every other signed-in device should force a sign-out.
	accountStatus: defineTable({
		userId: v.string(),
		unlinkedAt: v.number(),
	}).index("by_user", ["userId"]),
})
