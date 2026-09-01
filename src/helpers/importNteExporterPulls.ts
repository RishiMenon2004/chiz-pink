import { findArcByName } from "@/data/arcs"
import { findCharacterByName } from "@/data/characters"
import { EnumRarity, findRewardByName } from "@/data/items"
import { gachaPullsActions } from "@/hooks/useGachaStore"
import {
	MiracleBoxPull,
	ScarboroughFairPull,
	ImportedPull,
	ImportedPullsResult,
	NteExporterData,
	NteExporterRecord,
	PullsRecord,
} from "@/types/pulls"
import { getServerTimestamp } from "./serverTime"
import { readSettings } from "@/hooks/useSettingsStore"

const RESULT_TYPE_MAP: Record<
	NonNullable<NteExporterRecord["result_type"]>,
	ImportedPull["resultType"]
> = {
	dice: "dice",
	points_gift: "pointsGift",
	chase_reward: "slumberland",
}

export function isNteExporterData(data: unknown): data is NteExporterData {
	if (typeof data !== "object" || data === null) return false

	const record = data as Record<string, unknown>

	return (
		record.format === "nte-history-export" &&
		typeof record.exporter === "object" &&
		record.exporter !== null &&
		"name" in record.exporter &&
		record.exporter.name === "nte-history-exporter"
	)
}

export function parseNteExporterImport(
	data: NteExporterData
): ImportedPullsResult {
	let bannerType: ImportedPullsResult["bannerType"]
	const messages: string[] = []
	switch (data.banner.id) {
		case "Arc_MiracleBox":
			bannerType = "arc"
			messages.push("Arc Miracle Box Detected")
			break
		case "Lottery_LimitedCharacter":
			bannerType = "limited"
			messages.push("Limited Character Banner Detected")
			break
		case "Lottery_Permanent":
			bannerType = "permanent"
			messages.push("Permanent Banner Detected")
			break
		default:
			bannerType = "unknown"
			break
	}

	let server: ImportedPullsResult["server"]
	switch (data.server_id) {
		case "NA_SA":
			server = "America"
			break
		case "AS":
			server = "Asia"
			break
		case "EU":
			server = "Europe"
			break
		case "SA":
			server = "SEA"
			break
		default:
			server = "unknown"
			messages.push(
				"Unrecognised server detected in file. Using configured server instead."
			)
			break
	}

	let pullCounter = 0
	const pulls: ImportedPull[] = data.records.map((record, _, array) => {
		const [datePart, timePart] = record.timestamp.split(" ")
		const [year, month, day] = datePart.split("-").map(Number)
		const [hour, minute, second] = timePart.split(":").map(Number)

		const timestamp = getServerTimestamp(
			server === "unknown" ? readSettings().userdata.server : server,
			{
				year,
				month,
				day,
				hour,
				minute,
				second,
			}
		)

		let rank: EnumRarity

		switch (record.reward_rank) {
			case "B":
				rank = EnumRarity.Uncommon
				break
			case "A":
				rank = EnumRarity.Rare
				break
			case "S":
				rank = EnumRarity.Epic
				break
		}

		let rewardId: string = record.reward_name

		switch (record.reward_type) {
			case "arc":
				rewardId =
					findArcByName(record.reward_name)?.id ?? record.reward_name
				break
			case "character":
				rewardId =
					findCharacterByName(record.reward_name)?.id ??
					record.reward_name
				break
			case "item":
			case "cosmetic":
				rewardId =
					findRewardByName(record.reward_name)?.id ?? record.reward_name
				break
		}

		const resultType: ImportedPull["resultType"] =
			RESULT_TYPE_MAP[record.result_type ?? "dice"]

		// Arc pulls come in groups of 10, so pullIndex is the position within
		// the group (timestamp_group_ordinal). Scarborough Fair pulls use the
		// dice roll count instead.
		let pullIndex: number
		if (bannerType === "arc") {
			pullIndex = array.length - pullCounter
		} else {
			const diceRolls = array.filter((roll) => roll.result_type === "dice")
			pullIndex =
				resultType === "dice" ? diceRolls.length - pullCounter : -1
		}
		pullCounter += resultType === "dice" ? 1 : 0

		return {
			uid: record.uid,
			pullIndex,
			timestamp,
			rank,
			rewardId,
			rewardType: record.reward_type,
			resultType,
			diceRoll: record.roll_result,
			quantity: record.quantity,
		} satisfies ImportedPull
	})

	return {
		server,
		bannerType,
		bannerName: data.banner.name,
		pulls,
		messages,
	}
}

export function isScarboroughPull(
	pull: ImportedPull
): pull is ImportedPull & { diceRoll: number } {
	return "diceRoll" in pull
}

export function importParsedPulls(
	result: ImportedPullsResult
): ReturnType<typeof gachaPullsActions.addPulls> {
	let bannerType: keyof PullsRecord
	switch (result.bannerType) {
		case "permanent":
			bannerType = "permanentBanner"
			break
		case "limited":
			bannerType = "limitedBanner"
			break
		case "arc":
			bannerType = "arcsBanner"
			break
		case "unknown":
			return {
				status: "error",
				messages: ["Unrecognised Banner Type"],
			}
	}

	const pulls: MiracleBoxPull[] | ScarboroughFairPull[] = result.pulls.map(
		(pull) => {
			const {
				resultType,
				rewardType,
				diceRoll = 1,
				quantity = 0,
				...commonProps
			} = pull

			if (isScarboroughPull(pull)) {
				return {
					...commonProps,
					resultType,
					rewardType,
					diceRoll,
					quantity,
				} satisfies ScarboroughFairPull
			}

			return commonProps satisfies MiracleBoxPull
		}
	)

	return gachaPullsActions.addPulls(pulls, bannerType)
}
