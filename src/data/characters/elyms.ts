import { Character } from "@/types/character"
import { EnumRarity } from "../items"
import { EnumCharacterElement } from "./character"
import { EnumArcType } from "../arcs"
import {
	ascDelusionsSet,
	chargingKnightSparkPlug,
	goodBoyStamp,
	talentHeartSet,
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
	ascensionMaterialSet: ascDelusionsSet,
	ascensionBossMaterial: chargingKnightSparkPlug,
	talentMaterialSet: talentHeartSet,
	talentBossMaterial: goodBoyStamp,
	abilities: placeholderAbilities,
}
