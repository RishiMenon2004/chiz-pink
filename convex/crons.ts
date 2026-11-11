import { cronJobs } from "convex/server"

import { deleteExpiredDrops } from "./importDropRefs"

const crons = cronJobs()

crons.interval(
	"delete expired import drops",
	{ minutes: 10 },
	deleteExpiredDrops
)

export default crons
