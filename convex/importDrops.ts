import { v } from "convex/values"

import { internalMutation, mutation } from "./_generated/server"
import { deleteExpiredDrops } from "./importDropRefs"

export const DROP_LIFETIME_MS = 10 * 60 * 1000
// Just under Convex's 1 MiB document limit.
export const MAX_CIPHERTEXT_LENGTH = 900_000
// The endpoint is open to anyone, so this caps storage at about 180 MB. If it's
// abused, drops fail with 429 and the exporter falls back to the file flow.
const MAX_LIVE_DROPS = 200
// Each deleted payload can be nearly 1 MiB, and a transaction can only touch
// 16 MiB, so sweep in batches that fit even if every drop is at the cap.
const DELETE_BATCH_SIZE = 10

export const create = internalMutation({
	args: {
		dropId: v.string(),
		ciphertext: v.string(),
		iv: v.string(),
	},
	handler: async (ctx, { dropId, ciphertext, iv }) => {
		const now = Date.now()
		const live = await ctx.db
			.query("importDrops")
			.withIndex("by_expiry", (q) => q.gt("expiresAt", now))
			.take(MAX_LIVE_DROPS)

		if (live.length >= MAX_LIVE_DROPS) return null

		const expiresAt = now + DROP_LIFETIME_MS
		const payloadId = await ctx.db.insert("importDropPayloads", {
			ciphertext,
			iv,
		})
		await ctx.db.insert("importDrops", { dropId, payloadId, expiresAt })
		return { expiresAt }
	},
})

// Deleting as it's read keeps each drop single-use. An ID is a random UUID, and
// the data is unreadable without the key that only the URL fragment holds.
export const claim = mutation({
	args: { dropId: v.string() },
	handler: async (ctx, { dropId }) => {
		const drop = await ctx.db
			.query("importDrops")
			.withIndex("by_drop", (q) => q.eq("dropId", dropId))
			.unique()

		if (!drop) return null

		const payload = await ctx.db.get(drop.payloadId)
		await ctx.db.delete(drop.payloadId)
		await ctx.db.delete(drop._id)

		if (!payload || drop.expiresAt <= Date.now()) return null

		return { ciphertext: payload.ciphertext, iv: payload.iv }
	},
})

export const deleteExpired = internalMutation({
	args: {},
	handler: async (ctx) => {
		const expired = await ctx.db
			.query("importDrops")
			.withIndex("by_expiry", (q) => q.lte("expiresAt", Date.now()))
			.take(DELETE_BATCH_SIZE)

		await Promise.all(
			expired.flatMap((drop) => [
				ctx.db.delete(drop.payloadId),
				ctx.db.delete(drop._id),
			])
		)

		// A full batch may mean more are waiting, so don't leave them for the
		// next cron run.
		if (expired.length === DELETE_BATCH_SIZE) {
			await ctx.scheduler.runAfter(0, deleteExpiredDrops, {})
		}
	},
})
