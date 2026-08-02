import { Material } from "@/types/item"
import {
	annulith,
	beetleCoin,
	chaoticDye,
	dreamlessSeed,
	eliteHunterGuide,
	fons,
} from "../items/materials"

type ActivityPartWithReward = {
	name: string
	rewards: { material: Material; amount: number }[]
}

type ActivityParts =
	| { parts?: undefined; linear?: never }
	| {
			parts: string[] | ActivityPartWithReward[]
			linear: boolean
	  }

type ActivityData = {
	id: string
	name: string
	description: string
	type: "Daily" | "Weekly" | "Bi-Weekly" | "Monthly" | "Seasonal"
} & ActivityParts

export const allActivities = {
	/* Daily Tasks */
	dailyTasks: {
		id: "daily_tasks",
		name: "Daily Tasks",
		description: "Get 100 Daily Activity Points",
		type: "Daily",
		parts: [
			{
				name: "20",
				rewards: [
					{ material: annulith, amount: 10 },
					{ material: eliteHunterGuide, amount: 2 },
					{ material: beetleCoin, amount: 5000 },
				],
			},
			{
				name: "40",
				rewards: [
					{ material: annulith, amount: 10 },
					{ material: chaoticDye, amount: 2 },
					{ material: beetleCoin, amount: 5000 },
				],
			},
			{
				name: "60",
				rewards: [
					{ material: annulith, amount: 10 },
					{ material: beetleCoin, amount: 5000 },
				],
			},
			{
				name: "80",
				rewards: [
					{ material: annulith, amount: 10 },
					{ material: beetleCoin, amount: 5000 },
				],
			},
			{
				name: "100",
				rewards: [
					{ material: annulith, amount: 20 },
					{ material: dreamlessSeed, amount: 4 },
					{ material: fons, amount: 20000 },
				],
			},
		],
		linear: true,
	},
	circleBountyDaily: {
		id: "circle_bounty_daily",
		name: "Circle Bounty: Daily Quest",
		description: "Battlepass Daily Quests",
		type: "Daily",
		parts: [
			"Consume Character Pixels",
			"Get 100 Daily Activity Points",
			"Earn 10,000 Fons today",
			"Daily Login",
		],
		linear: false,
	},
	manageCafe: {
		id: "manage_cafe",
		name: "The Café by Origen",
		description: "Restock Café & Collect Earnings",
		type: "Daily",
	},
	bondGift: {
		id: "bond_gift",
		name: "Bond Gifts",
		description: "Send 10x Gifts",
		type: "Daily",
	},
	witchHouse: {
		id: "witch_house",
		name: "The Witch's House",
		description: "",
		type: "Daily",
		parts: ["Lost Tales", "Blessing", "Treasure Hunt"],
		linear: false,
	},
	nacupeda: {
		id: "nacupeda",
		name: "Nacupeda's Pool",
		description: "Make a wish/Steal Fons",
		type: "Daily",
	},
	fortuneShades: {
		id: "fortune_shades",
		name: "Fortune Shades",
		description: "Make an offering at Yuanmu Hill",
		type: "Daily",
	},
	bondDate: {
		id: "bond_date",
		name: "City Hangout",
		description: "Floe Cinema or Ferris Wheel Date",
		type: "Daily",
	},
	hobbyDelivery: {
		id: "hobby_delivery",
		name: "City Delivery",
		description: "Daily Deliveries",
		type: "Daily",
	},
	hobbyFishing: {
		id: "hobby_fishing",
		name: "Sea Angler",
		description: "Claim 3× Universal Bait & Sell recommended fishes",
		type: "Daily",
	},
	anomalyCloud: {
		id: "anomaly_cloud",
		name: "Compressed Boom Boom Cloud",
		description: "Collect Fluffy Clouds",
		type: "Daily",
	},
	anomalyHamster: {
		id: "anomaly_hamster",
		name: "Hamster Ball",
		description: "Collect random module piece",
		type: "Daily",
	},
	anomalyCrate: {
		id: "anomaly_crate",
		name: "Damaged Crate",
		description: "Collect Beetle Coins",
		type: "Daily",
	},

	/* Weekly Tasks */
	circleBountyWeekly: {
		id: "circle_bounty_weekly",
		name: "Circle Bounty: Weekly Quests",
		description: "Battlepass Weekly Quests",
		type: "Weekly",
	},
	cityStamina: {
		id: "city_stamina",
		name: "City Stamina",
		description: "Spend City Stamina",
		type: "Weekly",
	},
	anomalyPilgrimage: {
		id: "anomaly_pilgrimage",
		name: "Anomaly Pilgrimage",
		description: "3× Anomaly Pilgrimage",
		type: "Weekly",
	},
	auction: {
		id: "auction",
		name: "Ebisu Auction House",
		description: "Weekly Auctions",
		type: "Weekly",
	},
	anomalyMammon: {
		id: "anomaly_mammon",
		name: "Mammon: Realm of Greed",
		description: "Defeat Mammon to earn Fons.",
		type: "Weekly",
	},
	anomalyMailbox: {
		id: "anomaly_mailbox",
		name: "93/4 Mailbox",
		description: "Special City Delivery",
		type: "Weekly",
	},
	anomalyButler: {
		id: "anomaly_butler",
		name: "Personal Butler",
		description: "Quick explore Anomaly Zones",
		type: "Weekly",
	},
} satisfies Record<string, ActivityData>

export function getAllActivities() {
	return allActivities
}

const allActivitiesArray = Object.values(allActivities)

export function getAllActivitiesList() {
	return allActivitiesArray
}

export function getDailyActivities() {
	return allActivitiesArray.filter((activity) => activity.type === "Daily")
}
export function getWeeklyActivities() {
	return allActivitiesArray.filter((activity) => activity.type === "Weekly")
}
// export function getBiWeeklyActivities() {
// 	return allActivitiesArray.filter((activity) => activity.type === "Bi-Weekly")
// }
// export function getMonthlyActivities() {
// 	return allActivitiesArray.filter((activity) => activity.type === "Monthly")
// }
// export function getSeasonalActivities() {
// 	return allActivitiesArray.filter((activity) => activity.type === "Seasonal")
// }
