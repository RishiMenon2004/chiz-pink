import { Character } from "@/types/character"
import { EnumRarity } from "../items"
import { EnumCharacterElement } from "./character"
import { EnumArcType } from "../arcs"
import {
	ascWhispersSet,
	goodBoyStamp,
	talentBirdSet,
	waterMoonPick,
} from "../items/materials"
import { placeholderAbilities } from "./placeholder"

export const exe: Character = {
	isPlaceholder: true,
	id: "exe",
	imageSrc: "exe.webp",
	name: "Exe",
	description: "Details to be announced.",
	rarity: EnumRarity.Epic,
	element: EnumCharacterElement.CHAOS,
	arcType: EnumArcType.Solid,
	ascensionMaterialSet: ascWhispersSet,
	ascensionBossMaterial: waterMoonPick,
	talentMaterialSet: talentBirdSet,
	talentBossMaterial: goodBoyStamp,
	abilities: placeholderAbilities,
}
