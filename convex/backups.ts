import { v } from "convex/values"

import { mutation, query, QueryCtx } from "./_generated/server"

async function getOwnBackup(ctx: QueryCtx) {
	const identity = await ctx.auth.getUserIdentity()
	if (!identity) return null

	return ctx.db
		.query("backups")
		.withIndex("by_user", (q) => q.eq("userId", identity.subject))
		.unique()
}

export const getBackup = query({
	args: {},
	handler: async (ctx) => {
		const existing = await getOwnBackup(ctx)
		if (!existing) return null

		return {
			ciphertext: existing.ciphertext,
			iv: existing.iv,
			lastUpdated: existing.lastUpdated,
			unlinkedAt: existing.unlinkedAt,
		}
	},
})

export const upsertBackup = mutation({
	args: {
		ciphertext: v.string(),
		iv: v.string(),
		lastUpdated: v.number(),
	},
	handler: async (ctx, { ciphertext, iv, lastUpdated }) => {
		const identity = await ctx.auth.getUserIdentity()
		if (!identity) throw new Error("Not authenticated")

		const existing = await getOwnBackup(ctx)

		if (existing) {
			await ctx.db.patch(existing._id, { ciphertext, iv, lastUpdated })
		} else {
			await ctx.db.insert("backups", {
				userId: identity.subject,
				ciphertext,
				iv,
				lastUpdated,
			})
		}
	},
})

// Clears backup content without deleting the row, so an unlinkedAt marker
// set just before this call (see the unlink flow in RenderSettings.tsx)
// survives for other devices to react to.
export const deleteBackup = mutation({
	args: {},
	handler: async (ctx) => {
		const existing = await getOwnBackup(ctx)
		if (!existing) return

		if (existing.unlinkedAt != null) {
			await ctx.db.patch(existing._id, {
				ciphertext: undefined,
				iv: undefined,
				lastUpdated: undefined,
			})
		} else {
			await ctx.db.delete(existing._id)
		}
	},
})

// Called when a device unlinks the account, so every other signed-in device
// can react to the live getBackup query result and force its own sign-out.
export const markUnlinked = mutation({
	args: {},
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity()
		if (!identity) throw new Error("Not authenticated")

		const existing = await getOwnBackup(ctx)
		if (existing) {
			if (existing.unlinkedAt == null) {
				await ctx.db.patch(existing._id, { unlinkedAt: Date.now() })
			}
		} else {
			await ctx.db.insert("backups", {
				userId: identity.subject,
				unlinkedAt: Date.now(),
			})
		}
	},
})

// Called when a device explicitly (re-)signs in after being unlinked - that
// deliberate action is what makes this device trusted again.
export const clearUnlinked = mutation({
	args: {},
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity()
		if (!identity) throw new Error("Not authenticated")

		const existing = await getOwnBackup(ctx)
		if (existing?.unlinkedAt != null) {
			await ctx.db.patch(existing._id, { unlinkedAt: undefined })
		}
	},
})
