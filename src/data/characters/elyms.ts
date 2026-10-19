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

export const elyms: Character = {
	isPlaceholder: true,
	id: "elyms",
	imageSrc: "elyms.webp",
	name: "Elyms",
	description: "Details to be announced.",
	rarity: EnumRarity.Epic,
	element: EnumCharacterElement.COSMOS,
	arcType: EnumArcType.Solid,
	ascensionMaterialSet: ascWhispersSet,
	ascensionBossMaterial: waterMoonPick,
	talentMaterialSet: talentBirdSet,
	talentBossMaterial: goodBoyStamp,
	abilities: placeholderAbilities,
}
