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

export const ellie: Character = {
	isPlaceholder: true,
	hasPlaceholderArcType: true,
	hasPlaceholderMaterials: true,
	id: "ellie",
	imageSrc: "placeholder.webp",
	name: "Ellie",
	gender: "female",
	description: "Details to be announced.",
	rarity: EnumRarity.Epic,
	element: EnumCharacterElement.INCANTATION,
	arcType: EnumArcType.Solid,
	ascensionMaterialSet: ascWhispersSet,
	ascensionBossMaterial: waterMoonPick,
	talentMaterialSet: talentBirdSet,
	talentBossMaterial: goodBoyStamp,
	abilities: placeholderAbilities,
}
