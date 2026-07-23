import { mutation, query, QueryCtx } from "./_generated/server"

async function getOwnStatus(ctx: QueryCtx) {
	const identity = await ctx.auth.getUserIdentity()
	if (!identity) return null

	return ctx.db
		.query("accountStatus")
		.withIndex("by_user", (q) => q.eq("userId", identity.subject))
		.unique()
}

export const isUnlinked = query({
	args: {},
	handler: async (ctx) => Boolean(await getOwnStatus(ctx)),
})

// Called when a device unlinks the account, so every other signed-in device
// can react to the live query result and force its own sign-out.
export const markUnlinked = mutation({
	args: {},
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity()
		if (!identity) throw new Error("Not authenticated")

		const existing = await getOwnStatus(ctx)
		if (!existing) {
			await ctx.db.insert("accountStatus", {
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

		const existing = await getOwnStatus(ctx)
		if (existing) await ctx.db.delete(existing._id)
	},
})
