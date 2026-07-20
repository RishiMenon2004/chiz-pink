import { Character } from "@/types/character"

import { EnumRarity } from "@/data/items"
import {
	ascSilhouetteSet,
	dressSleevesOfVanity,
	talentHeartSet,
	waterMoonPick,
} from "@/data/items/materials"
import { EnumArcType } from "@/data/arcs"
import { EnumCharacterElement } from "@/data/characters"

export const fadia: Character = {
	id: "fadia",
	imageSrc: "fadia.png",
	name: "Fadia",
	description:
		"A dangerous yet captivating ETD member who represents the director's unpredictable hiring standards.",
	rarity: EnumRarity.Epic,
	element: EnumCharacterElement.PSYCHE,
	arcType: EnumArcType.Condensate,
	ascensionMaterialSet: ascSilhouetteSet,
	ascensionBossMaterial: waterMoonPick,
	talentMaterialSet: talentHeartSet,
	talentBossMaterial: dressSleevesOfVanity,
	abilities: {
		basicAttack: {
			name: "Wordless Rejection",
			description: [
				{
					section: "Wordless Rejection",
					description:
						"Swings her cross shield and performs up to <dn>5</> consecutive attacks, dealing Psyche DMG.",
				},
				{
					section: "All Eyes on Me",
					description:
						"When Fadia's current HP is greater than <dn>1</>, she redirects a portion of damage taken by her teammates to herself before any shield mitigation is applied. Redirected damage cannot be further redistributed.\nOnce Fadia's current HP drops to <dn>1</>, she ceases to redirect damage. At this point, if Fadia receives damage, she will share it with surviving teammates before any shield mitigation, and will absorb the remaining damage herself.",
				},
				{
					section: "Falling Contempt",
					description:
						"Swings her cross shield in the air and plunges, dealing <dn>1</> instance of Psyche DMG to an area upon impact. Increases DMG based on fall height, up to 100%.",
				},
				{
					section: "Critical Riposte: Evasion Trigger",
					description:
						"Triggers when casting Wordless Rejection after a Critical Dodge. Charges toward the target at high speed and deals <dn>1</> instance of Psyche DMG to an area, reducing Break.",
				},
			],
			maxLvl: 10,
		},
		skill: {
			name: "Existence",
			description: [
				{
					description:
						"Come, have a taste of this. Deals <dn>1</> instance of Psyche DMG to an area and inflicts Destructive Experience on the enemy with the highest Max HP in the area for a period.\nDuring the duration, when Fadia takes damage, the target shares a percentage of the damage taken.\nDestructive Experience ends when the duration expires, when the Redirection DMG taken by the target reaches its cap, or when the target and Fadia leave combat.",
				},
			],
			maxLvl: 10,
		},
		ultimate: {
			name: "Agony to Euphoria",
			description: [
				{
					description:
						"Without pain, life closes in on itself. Enters Lilith state, dealing <dn>6</> instances of Mental DMG and restoring HP. Recasts Wordless Rejection while in Lilith state to perform up to <dn>5</> follow-up attacks, each dealing Mental DMG.\nFully restores the energy of Agony to Euphoria when lost HP reaches the Destructive Threshold. Increases the damage and HP restored by Agony to Euphoria when it is cast with lost HP greater than or equal to the Destructive Threshold.\nExits Lilith state when the duration ends, all 5 follow-up attacks are performed, characters are switched, or other skills of Fadia are used.",
				},
			],
			maxLvl: 10,
		},
		support: {
			name: "Outsider",
			description: [
				{
					description:
						"Swings her cross shield, dealing <dn>1</> instance of Psyche DMG to an area.",
				},
			],
			maxLvl: 10,
		},
		passive1: {
			name: "Furnace of Guilt",
			description: [
				{
					description:
						"<sh>Nova Enhancement:</> Allows all allies to drain Max HP from the target when Nova ends. The target loses Max HP equal to 200% of Fadia's base Max HP, and each ally gains Max HP equal to 10% of Fadia's base Max HP. Total drained cannot exceed 50% of Fadia's base Max HP. Restores both parties' stats upon exiting combat.",
				},
			],
			maxLvl: 1,
		},
		passive2: {
			name: "Denial and Plunder",
			description: [
				{
					description:
						"Like a baby yearning for nourishment from mommy. When Fadia is in the team, increases team max HP by <dn>10%</>.",
				},
			],
			maxLvl: 1,
		},
		lifeSkill1: {
			name: "Good Driving",
			description: [
				{
					description:
						"<sh>Level 1:</> Grants an additional <dn>1000</> Fons in tips for each order in Swift Travel.",
				},
				{
					description:
						"<sh>Level 2:</> In Swift Travel, final satisfaction for orders is increased by an additional <dn>25</> points.",
				},
				{
					description:
						"<sh>Level 3:</> Grants an additional <dn>1000</> Fons in tips for each order in Swift Travel.",
				},
				{
					description:
						"<sh>Level 4:</> In Swift Travel, final satisfaction for orders is increased by an additional <dn>25</> points.",
				},
				{
					description:
						"<sh>Level 5:</> In Swift Travel, the satisfaction cap for each customer is increased by <dn>50</> points.",
				},
			],
			maxLvl: 5,
		},
	},
}
