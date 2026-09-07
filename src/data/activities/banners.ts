import {
	getPhase1End,
	getPhase1Start,
	getPhase2End,
	getPhase2Start,
} from "./events"

export const arcBanners = [
	{
		name: "Tiger Special",
		rateupItem: "ready_ready",
		getStartDate: getPhase1Start("version1_0"),
		getEndDate: getPhase1End("version1_0"),
	},
	{
		name: "Bright Moon Special",
		rateupItem: "marching_beyond_time",
		getStartDate: getPhase2Start("version1_0"),
		getEndDate: getPhase2End("version1_0"),
	},
	{
		name: "Nocturne Special",
		rateupItem: "the_last_rose",
		getStartDate: getPhase1Start("version1_1"),
		getEndDate: getPhase1End("version1_1"),
	},
	{
		name: "Pursuit Special",
		rateupItem: "whats_desired",
		getStartDate: getPhase2Start("version1_1"),
		getEndDate: getPhase2End("version1_1"),
	},
	{
		name: "Resolve Special",
		rateupItem: "blushing_mirage",
		getStartDate: getPhase1Start("version1_2"),
		getEndDate: getPhase1End("version1_2"),
	},
	{
		name: "Dreamgate Special",
		rateupItem: "the_wrong_gate",
		getStartDate: getPhase2Start("version1_2"),
		getEndDate: getPhase2End("version1_2"),
	},
	{
		name: "Spellbound Special",
		rateupItem: "ravenous_blade",
		getStartDate: getPhase1Start("version1_3"),
		getEndDate: getPhase1End("version1_3"),
	},
	{
		name: "Surfing All Channels: Linko",
		rateupItem: "voice_of_the_voyager",
		getStartDate: getPhase2Start("version1_3"),
		getEndDate: getPhase2End("version1_3"),
	},
	{
		name: "Tiger Special",
		rateupItem: "ready_ready",
		getStartDate: getPhase1Start("version1_3"),
		getEndDate: getPhase1End("version1_3"),
	},
	{
		name: "Bright Moon Special",
		rateupItem: "marching_beyond_time",
		getStartDate: getPhase2Start("version1_3"),
		getEndDate: getPhase2End("version1_3"),
	},
]

export const permanentBanner = {
	name: "Bright Moon Special",
	rateupItems: ["baicang", "daffodill", "fadia", "hathor", "jiuyuan", "sakiri"],
}
