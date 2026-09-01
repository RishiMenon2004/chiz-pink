import { EnumRarity } from "@/data/items"
import { SettingsRecord } from "./settings"

type NteBannerType =
	"Lottery_LimitedCharacter" | "Lottery_Permanent" | "Arc_MiracleBox"

type NteExporterBanner = {
	id: NteBannerType
	name: string
	system: "Monopoly" | "Gashapon"
	shared_pity: boolean
}

type NteExporterScan = {
	mode: "stable_only"
	boundary_policy: "export_ordinal_stable_groups"
	decoded_records: number
	exported_records: number
	skipped_records: number
	warnings: string[]
	pages_seen: number[]
}

export type NteExporterRecord = {
	uid: string
	pool_group_id: NteBannerType
	timestamp: string
	timestamp_group_ordinal: number
	reward_type: "arc" | "item" | "cosmetic" | "character"
	reward_id: string
	reward_name: string
	reward_rank: "B" | "A" | "S"
	source_type?: string
	roll_result?: 4
	result_type?: "dice" | "points_gift" | "chase_reward"
	quantity?: 1
}

export type NteExporterData = {
	format: "nte-history-export"
	format_version: number
	game: "Neverness to Everness"
	source: string
	capture_source: string
	user_uid: string
	server_id: "NA_SA" | "AS" | "EU" | "SA"
	account_region: string
	exporter: {
		name: string
		version: string
	}
	banner: NteExporterBanner
	scan: NteExporterScan
	records: NteExporterRecord[]
}

export type ImportedPull = {
	uid: string
	pullIndex: number
	timestamp: number
	resultType: "pointsGift" | "slumberland" | "dice"
	rank: EnumRarity
	rewardId: string
	rewardType: NteExporterRecord["reward_type"]
	diceRoll?: number
	quantity?: number
}

export type ImportedPullsResult = {
	bannerType: "permanent" | "limited" | "arc" | "unknown"
	bannerName: string
	server: SettingsRecord["userdata"]["server"] | "unknown"
	pulls: ImportedPull[]
	messages: string[]
}

export type MiracleBoxPull = {
	uid: string
	pullIndex: number
	timestamp: number
	rank: EnumRarity
	rewardId: string
}

export type ScarboroughFairPull = {
	uid: string
	pullIndex: number
	timestamp: number
	rank: EnumRarity
	rewardId: string
	diceRoll: number
	resultType: ImportedPull["resultType"]
	rewardType: ImportedPull["rewardType"]
	quantity: number
}

export type PullsRecord = {
	arcsBanner: Record<string, MiracleBoxPull>
	limitedBanner: Record<string, ScarboroughFairPull>
	permanentBanner: Record<string, ScarboroughFairPull>
}
