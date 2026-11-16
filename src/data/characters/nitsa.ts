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

export const nitsa: Character = {
	isPlaceholder: true,
	hasPlaceholderMaterials: true,
	id: "nitsa",
	imageSrc: "placeholder.webp",
	name: "Nitsa",
	gender: "female",
	description: "Details to be announced.",
	rarity: EnumRarity.Epic,
	element: EnumCharacterElement.PSYCHE,
	arcType: EnumArcType.Liquid,
	ascensionMaterialSet: ascWhispersSet,
	ascensionBossMaterial: waterMoonPick,
	talentMaterialSet: talentBirdSet,
	talentBossMaterial: goodBoyStamp,
	abilities: placeholderAbilities,
}
