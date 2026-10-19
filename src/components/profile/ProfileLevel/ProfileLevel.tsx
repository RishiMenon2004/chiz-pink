"use client"

import { ReactNode, useState } from "react"

import { EnumItemLvls } from "@/data/items"

import { ProfileLevelContext, useProfileLevelContext } from "@/contexts"

// Every level step the planner offers (1, 20, 20+, 30, ... 80); ascended
// steps ("20+") are the notches between the labelled levels.
export const LEVELS = Object.keys(EnumItemLvls)
	.filter((key) => isNaN(Number(key)))
	.map((key) => ({
		value: EnumItemLvls[key as keyof typeof EnumItemLvls],
		label: key.replace("Lvl", "").replace("A", "+"),
		isAscension: key.endsWith("A"),
	}))

export const MAX_LEVEL_INDEX = LEVELS.length - 1

// Shares the Materials slider's level with the rest of the profile.
export function ProfileLevelProvider({ children }: { children: ReactNode }) {
	const [index, setIndex] = useState(MAX_LEVEL_INDEX)

	return (
		<ProfileLevelContext.Provider value={{ index, setIndex }}>
			{children}
		</ProfileLevelContext.Provider>
	)
}

// One value per LEVELS step; shows the one for the slider's level.
export function LevelStatValue({ values }: { values: string[] }) {
	const index = useProfileLevelContext()?.index ?? MAX_LEVEL_INDEX
	return values[index] ?? values.at(-1)
}
