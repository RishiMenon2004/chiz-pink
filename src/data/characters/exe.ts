import { Character } from "@/types/character"
import { EnumRarity } from "../items"
import { EnumCharacterElement } from "./character"
import { EnumArcType } from "../arcs"
import {
	ascNumeralSet,
	confessionalFLowerSeed,
	hollowflowerSeed,
	talentTarotSet,
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
	arcType: EnumArcType.Plasma,
	ascensionMaterialSet: ascNumeralSet,
	ascensionBossMaterial: confessionalFLowerSeed,
	talentMaterialSet: talentTarotSet,
	talentBossMaterial: hollowflowerSeed,
	abilities: {
		...placeholderAbilities,
		basicAttack: {
			name: "Brute-Force Hacking",
			description: [
				{
					section: "Basic Attack: Brute-Force Hacking",
					description:
						"Exe commands the Hand of Y to perform a 5-hit Basic Attack combo. The final hit can spend <dn>10</> Frames to export <dn>1</> Digital Echo.",
				},
				{
					section: "Basic Attack: Network Penetration",
					description:
						"Hold Basic Attack to perform Basic Attack: Network Penetration.\nWhile Exe is in his Ultimate's Shader Compile state, performing Basic Attack: Network Penetration locks onto the non-boss target with the lowest HP. If that target is below <dn>15%</> HP, it is executed outright, and the Shader Compile state is extended.",
				},
			],
			maxLvl: 10,
		},
		skill: {
			name: "Data Exfiltration",
			description: [
				{
					description:
						"Exe commands the Hand of Y to deal DMG, exporting up to <dn>5</> Digital Echoes based on the Frames he currently holds.",
				},
			],
			maxLvl: 10,
		},
		ultimate: {
			name: "Mesh Collision",
			description: [
				{
					description:
						"Exe digitally reconstructs reality and enters the Shader Compile state, commanding the Hand of Y to unleash multiple attacks that deal heavy DMG to targets in an area. Based on the Frames he currently holds, he also exports multiple Digital Echoes.\nWhile in the Shader Compile state, all of Exe's attacks can spend Frames to export Digital Echoes.",
				},
			],
			maxLvl: 10,
		},
	},
}
