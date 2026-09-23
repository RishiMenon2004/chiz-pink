import { v } from "convex/values"

import { mutation, query, QueryCtx } from "./_generated/server"

async function getOwnGachaBackup(ctx: QueryCtx) {
	const identity = await ctx.auth.getUserIdentity()
	if (!identity) return null

	return ctx.db
		.query("gachaBackups")
		.withIndex("by_user", (q) => q.eq("userId", identity.subject))
		.unique()
}

export const getBackup = query({
	args: {},
	handler: async (ctx) => {
		const existing = await getOwnGachaBackup(ctx)
		if (!existing) return null

		return {
			ciphertext: existing.ciphertext,
			iv: existing.iv,
			lastUpdated: existing.lastUpdated,
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

		const existing = await getOwnGachaBackup(ctx)

		if (existing) {
			await ctx.db.patch(existing._id, { ciphertext, iv, lastUpdated })
		} else {
			await ctx.db.insert("gachaBackups", {
				userId: identity.subject,
				ciphertext,
				iv,
				lastUpdated,
			})
		}
	},
})

export const deleteBackup = mutation({
	args: {},
	handler: async (ctx) => {
		const existing = await getOwnGachaBackup(ctx)
		if (existing) await ctx.db.delete(existing._id)
	},
})
