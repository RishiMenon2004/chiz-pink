import { Character } from "@/types/character"

import { EnumRarity } from "@/data/items"
import {
	ascNumeralSet,
	goodBoyStamp,
	nestGuardFragment,
	talentMagicSet,
} from "@/data/items/materials"
import { EnumArcType } from "@/data/arcs"
import { EnumCharacterElement } from "@/data/characters"

export const baicang: Character = {
	id: "baicang",
	imageSrc: "baicang.png",
	name: "Baicang",
	description: "The widely recognized \"least captain-like captain\" from ETD-4.",
	rarity: EnumRarity.Epic,
	element: EnumCharacterElement.INCANTATION,
	arcType: EnumArcType.Condensate,
	ascensionMaterialSet: ascNumeralSet,
	ascensionBossMaterial: nestGuardFragment,
	talentMaterialSet: talentMagicSet,
	talentBossMaterial: goodBoyStamp,
	abilities: {
		basicAttack: {
			name: "Walk the Talk",
			description: [
				{
					section: "Basic Attack: Walk the Talk",
					description:
						"Uses martial arts to perform up to 5 consecutive attacks, dealing Incantation DMG.",
				},
				{
					section: "Basic Attack: Formless Words",
					description:
						"Hold Basic Attack to trigger Formless Words after the <dn>1st</> and <dn>2nd</> hits of Walk the Talk.\nRelease the stick and hold Dodge to trigger Formless Words during battle.\nFires <dn>3</> incantation commands horizontally. After a brief delay, the commands detonate, with each dealing <dn>1</> instance of Incantation DMG to an area.",
				},
				{
					section: "Basic Attack: Unrestrained Words",
					description:
						"Hold Basic Attack to trigger Unrestrained Words after the <dn>3rd</> hit of Walk the Talk.\nHold down the stick and hold Dodge to trigger Unrestrained Words during battle.\nFires <dn>3</> incantation commands vertically. After a brief delay, the commands detonate, with each dealing <dn>1</> instance of Incantation DMG to an area.",
				},
				{
					section: "Basic Attack: In the Wind",
					description:
						"Leaps in the wind and strikes, dealing <dn>1</> instance of Incantation DMG to an area upon impact. Increases DMG based on fall height, up to 100%.",
				},
				{
					section: "Critical Riposte: Truth Exposed",
					description:
						"Triggers when casting Walk the Talk after a Critical Dodge. Performs a knee strike on the target, dealing <dn>1</> instance of Incantation DMG to an area, reducing their Break. Generates <dn>1</> Power Word Bless on the target when hit.",
				},
				{
					section: "Basic Attack: Shadow Follows",
					description:
						"Generates a Power Word Bless on the enemy for every <dn>3</> Walk the Talk hits. This word lasts for <dn>15</>s, and a maximum of <dn>3</> can be generated.\nConsumes <dn>3%</> of Baicang's current HP whenever any Power Word is summoned. When Baicang's HP is below <dn>50%</>, the amount consumed is halved.",
				},
			],
			maxLvl: 10,
		},
		skill: {
			name: "Generous Guidance",
			description: [
				{
					section: "Heart of Heaven and Earth",
					description:
						"Words and text emerge from the ley lines, converge at the target location, and unleash an attack.",
				},
				{
					section: "Silenced Thought",
					description:
						"Press Redirect Skill after triggering a dodge.\nAttacks a single target, dealing Incantation DMG to them on hit. Generates <dn>1</> Power Word Silence on the target when attacks hit.",
				},
				{
					section: "Such Crime",
					description:
						"Press Redirect Skill after triggering Formless Words or Unrestrained Words.\nExpanded the damage range, dealing AoE Incantation DMG on hit. Generates <dn>1</> Power Word Objurgate on the ground near the target when attacks hit.",
				},
			],
			maxLvl: 10,
		},
		ultimate: {
			name: "Judgment of Autumn",
			description: [
				{
					description:
						"Look up, and fall into the polar abyss. Releases a domain and enters Power Word state, dealing Incantation DMG over time to targets.\nExecutes the target when their HP is below <dn>10%</> (Boss HP below <dn>5%</>).\nBecomes immune to one fatal hit temporarily during Judgment of Autumn and records its value. Ends the domain automatically <dn>3</>s after triggering the immunity effect and takes the recorded damage slowly over <dn>10</>s after ending.\nDeals high single-target damage within the domain when Silence is triggered; Deals AoE DMG when Objurgate is triggered; Deals damage to a single target and restores <dn>5%</> of Baicang's Max HP when Bless is triggered.",
				},
			],
			maxLvl: 10,
		},
		support: {
			name: "Break Time Over",
			description: [
				{
					description:
						"Witness the power that words bestow. Charges briefly and writes incantation commands, targeting enemies and dealing <dn>1</> instance of Incantation DMG to an area. Generates <dn>1</> Power Word Silence on target when attacks hit.",
				},
			],
			maxLvl: 10,
		},
		passive1: {
			name: "Moderate Mischief",
			description: [
				{
					description:
						"<sh>Scorch Enhancement:</> Inflicts another instance of Scorch with the same effect as the existing one when a Power Word is generated on a target affected by Scorch.",
				},
			],
			maxLvl: 1,
		},
		passive2: {
			name: "Moderate Working",
			description: [
				{
					description:
						"Increases Baicang's ATK by <dn>20%</>.\nLaunches coordinate attacks with the allies when there are ETD-4 members in the Team.\nIn combat, switching to Baicang while Skia is in stealth to immediately attack with Baicang and generate 1 Power Word Silence on target. Cooldown: <dn>30</>s.\nIn combat, when Fadia's HP drops below <dn>20%</>, Baicang attacks the enemy <dn>1</> time, heals Fadia <dn>1</> time, and generates <dn>1</> Power Word Silence on target. Cooldown: <dn>30</>s.\nSwitching to Baicang while Lacrimosa is in bat form can trigger <dn>1</> super jump for Baicang.",
				},
			],
			maxLvl: 1,
		},
		lifeSkill1: {
			name: "Thriving Daily",
			description: [
				{
					description:
						"<sh>Level 1:</> Baicang increases traffic by <dn>18</>.",
				},
				{
					description:
						"<sh>Level 2:</> Baicang reduces ingredient consumption rate by <dn>1%</>.",
				},
				{
					description:
						"<sh>Level 3:</> In Owner's Selection, combos persist when customers lose patience or get hit by hammers.",
				},
				{
					description:
						"<sh>Level 4:</> Baicang reduces ingredient consumption rate by <dn>1%</>.",
				},
				{
					description:
						"<sh>Level 5:</> Baicang increases traffic by <dn>27</>.",
				},
			],
			maxLvl: 5,
		},
	},
}
