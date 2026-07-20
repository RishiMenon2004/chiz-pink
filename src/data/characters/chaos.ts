import { Character } from "@/types/character"

import { EnumRarity } from "@/data/items"
import {
	ascWhispersSet,
	eternalMemory,
	talentHeartSet,
	tearOfTheSea,
} from "@/data/items/materials"
import { EnumArcType } from "@/data/arcs"
import { EnumCharacterElement } from "@/data/characters"

export const chaos: Character = {
	id: "chaos",
	imageSrc: "chaos.png",
	name: "Chaos",
	description:
		"Current member of ETD-6. Your most righteous and reliable friend.",
	rarity: EnumRarity.Epic,
	element: EnumCharacterElement.LAKSHANA,
	arcType: EnumArcType.Condensate,
	ascensionMaterialSet: ascWhispersSet,
	ascensionBossMaterial: tearOfTheSea,
	talentMaterialSet: talentHeartSet,
	talentBossMaterial: eternalMemory,
	abilities: {
		basicAttack: {
			name: "Pursuit",
			description: [
				{
					section: "Basic Attack: Pursuit",
					description:
						"Wields his weapon and performs up to <dn>5</> consecutive attacks, dealing Lakshana DMG and building up Crime.",
				},
				{
					section: "Basic Attack: Final Verdict",
					description:
						"Your guilt is plain to see. Hold Basic Attack to trigger Final Verdict. Consumes all Crime to add a 2nd hit to Final Verdict and deal heavy Settlement DMG if current Crime is at its cap (1000). Performs only the 1st hit of Final Verdict, dealing <dn>2</> instances of damage, if Crime has not reached its cap.",
				},
				{
					section: "Basic Attack: Overturn",
					description:
						"Press Basic Attack while airborne to plunge, dealing <dn>1</> instance of Lakshana DMG to an area upon impact. Increases DMG based on fall height, up to <dn>1×</>. Focuses his mind and awakens a hunter's perception, sensing nearby enemies for a short time. Sensed targets are highlighted with a special outline.",
				},
				{
					section: "Critical Riposte: Intuition / Instinct",
					description:
						"Triggers when using Pursuit after performing a Critical Dodge. Swings his hatchet at the target, dealing <dn>1</> instance of Lakshana DMG and reducing break.",
				},
			],
			maxLvl: 10,
		},
		skill: {
			name: "Doubtmark",
			description: [
				{
					section: "Doubtmark",
					description:
						"Target traits confirmed. Fires at enemies ahead and summons his hound to pounce on the target. The hound bites the target back and forth twice. Inflicts Warrant on up to <dn>2</> enemies for <dn>15</>s when the skill hits. Increases damage dealt by <dn>20%</> when attacking targets with Warrant.",
				},
				{
					description:
						"Increases the damage against targets with Warrant.",
				},
			],
			maxLvl: 10,
		},
		ultimate: {
			name: "Retribution",
			description: [
				{
					description:
						"Summons his hound to suppress nearby enemies, inflicting Warrant on all enemies within range and entering the Dread Echo state. Rapidly increases Crime over time while Chaos and Dread Echo are active, allowing Final Verdict to be cast more often and deal heavy Settlement DMG.",
				},
			],
			maxLvl: 10,
		},
		support: {
			name: "Onslaught",
			description: [
				{
					description:
						"Don't even think about running! Swings his scythe upward, dealing <dn>1</> instance of Lakshana DMG.",
				},
			],
			maxLvl: 10,
		},
		passive1: {
			name: "Justice in Time",
			description: [
				{
					description:
						"<sh>Remora Enhancement:</> Deals Lakshana DMG equal to 800% of ATK to the target when Remora ends, based on Remora's duration. Each second beyond the base 5s duration increases total DMG by 45%, up to 300%. Resets Remora's duration when reapplied.",
				},
			],
			maxLvl: 1,
		},
		passive2: {
			name: "Prime Target",
			description: [
				{
					description:
						"Increases the damage bonus from Warrant to <dn>30%</>.",
				},
			],
			maxLvl: 1,
		},
		lifeSkill1: {
			name: "Master Angler",
			description: [
				{
					description:
						"<sh>Level 1:</> Increases the daily high-value order limit in the Fish Market in Sea Angler by <dn>1</>.",
				},
				{
					description:
						"<sh>Level 2:</> Increases special bait effects in Sea Angler by <dn>25%</>.",
				},
				{
					description:
						"<sh>Level 3:</> Reduces the Stamina of valuable and rare fish in Sea Angler by <dn>1</>.",
				},
				{
					description:
						"<sh>Level 4:</> Increases the daily high-value order limit in the Fish Market in Sea Angler by <dn>1</>.",
				},
				{
					description:
						"<sh>Level 5:</> Reduces the Stamina of all fish in Sea Angler by <dn>1</>.",
				},
			],
			maxLvl: 5,
		},
		lifeSkill2: {
			name: "Memory / Anchor",
			description: [
				{
					description:
						"<sh>Level 1:</> Increases the Teleport Anchor placement limit to <dn>2</>.",
				},
			],
			maxLvl: 1,
		},
	},
}
