import { Character } from "@/types/character"

import { EnumRarity } from "@/data/items"
import {
	ascDelusionsSet,
	chargingKnightSparkPlug,
	dressSleevesOfVanity,
	talentTarotSet,
} from "@/data/items/materials"
import { EnumArcType } from "@/data/arcs"
import { EnumCharacterElement } from "@/data/characters"

export const daffodill: Character = {
	id: "daffodill",
	imageSrc: "daffodill.png",
	name: "Daffodill",
	description:
		"A ruthless bodyguard of few words, working exclusively for Eibon.",
	rarity: EnumRarity.Epic,
	element: EnumCharacterElement.CHAOS,
	arcType: EnumArcType.Liquid,
	ascensionMaterialSet: ascDelusionsSet,
	ascensionBossMaterial: chargingKnightSparkPlug,
	talentMaterialSet: talentTarotSet,
	talentBossMaterial: dressSleevesOfVanity,
	abilities: {
		basicAttack: {
			name: "Still Waters",
			description: [
				{
					section: "Basic Attack: Still Waters",
					description:
						"Her heart is as calm as still waters, long accustomed to battle. Wields her twin blades to perform up to 5 consecutive attacks, dealing Chaos DMG.",
				},
				{
					section: "Basic Attack: Light Prism",
					description:
						"Light and shadow exist in separate realms. Daffodill's Break Damage contribution is increased by 20%.",
				},
				{
					section: "Basic Attack: Mirror on Water",
					description:
						"I am here. Hold Basic Attack to trigger. Dashes forward, performing a whirlwind slash and leaving behind marks, dealing Chaos DMG.",
				},
				{
					section: "Basic Attack: Displaced Edge",
					description:
						"Press dodge to trigger the special dodge action Displaced Edge during Still Waters. Grants invincibility during the action and does not interrupt the current combo.",
				},
				{
					section: "Basic Attack: Crosshair Lock",
					description:
						"Wields her weapon while airborne and plunges, dealing 1 instance of Chaos DMG to an area upon impact. Increases DMG based on fall height, up to 100%.",
				},
				{
					section: "Critical Riposte: Close Call",
					description:
						"Triggers when using Still Waters after performing a Critical Dodge. Instantly lifts her foot, pulling the rope to swing her blade toward the target, dealing 1 instance of Chaos DMG and reducing Break.",
				},
			],
			maxLvl: 10,
		},
		skill: {
			name: "Resonance",
			description: [
				{
					section: "Redirect Skill: Resonance",
					description:
						"Resonating with the blade. Deals damage to the target. Grants Resonance stacks and increases damage when any team member casts a Support Skill. Increases Resonance's DMG and Break per Support Skill cast, up to 2 stacks. Enhances Resonance and replaces it with Echoes when stacks reach the maximum.",
				},
				{
					section: "Redirect Skill: Echoes",
					description:
						"Resonance carries sound, echo responds in kind. Swiftly shifts her stance, swinging her blade with the rope to deal Chaos DMG to the target.",
				},
			],
			maxLvl: 10,
		},
		ultimate: {
			name: "Finale",
			description: [
				{
					description:
						"Casts Finale, dealing Chaos DMG to enemies in an area. Unseals her left eye, increasing damage and inflicting Insight on nearby enemies for the duration. Unlocks the skill Phantom Step, which can be used up to 2 times. Casting Finale resets Phantom Step charges.",
				},
			],
			maxLvl: 10,
		},
		support: {
			name: "Crossed Blades",
			description: [
				{
					description:
						"Leave the rest to me. Swings her blade in a slashing motion, dealing 1 instance of Chaos DMG to the target.",
				},
			],
			maxLvl: 10,
		},
		passive1: {
			name: "Blade Draw",
			description: [
				{
					description:
						"<sh>Discord Enhancement:</> Further reduces the target's Break cap by 10% for 30s while affected by Discord and restores it to normal upon leaving combat. Stacks Discord Enhancement effects up to a maximum reduction of 20% of the target's initial Break cap.",
				},
			],
			maxLvl: 1,
		},
		passive2: {
			name: "Cicada Shell",
			description: [{ description: "Increases Phantom Step DMG by 80%." }],
			maxLvl: 1,
		},
		lifeSkill1: {
			name: "The Art of Hospitality",
			description: [
				{
					description:
						"<sh>Level 1:</> Daffodill increases traffic by <dn>18</>.",
				},
				{
					description:
						"<sh>Level 2:</> Daffodill reduces ingredient consumption rate by <dn>1%</>.",
				},
				{
					description:
						"<sh>Level 3:</> In Owner's Selection, customers are more likely to choose the highest-priced dishes.",
				},
				{
					description:
						"<sh>Level 4:</> Daffodill reduces ingredient consumption rate by <dn>1%</>.",
				},
				{
					description:
						"<sh>Level 5:</> Daffodill increases traffic by <dn>27</>.",
				},
			],
			maxLvl: 5,
		},
	},
}
