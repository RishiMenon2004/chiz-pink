import { Character } from "@/types/character"

import { EnumRarity } from "@/data/items"
import {
	ascWhispersSet,
	goodBoyStamp,
	talentBirdSet,
	tearOfTheSea,
} from "@/data/items/materials"
import { EnumArcType } from "@/data/arcs"
import { EnumCharacterElement } from "./character"

export const chiz: Character = {
	id: "chiz",
	imageSrc: "chiz.webp",
	name: "Chiz",
	description:
		"Though she may seem a bit timid, she's the Pink Paws Bank's most dependable manager.",
	rarity: EnumRarity.Epic,
	element: EnumCharacterElement.COSMOS,
	arcType: EnumArcType.Gas,
	ascensionMaterialSet: ascWhispersSet,
	ascensionBossMaterial: tearOfTheSea,
	talentMaterialSet: talentBirdSet,
	talentBossMaterial: goodBoyStamp,
	abilities: {
		basicAttack: {
			name: "Exiled Swordplay",
			description: [
				{
					section: "Basic Attack: Exiled Swordplay",
					description:
						"Swings the short staff to perform up to <dn>5</> consecutive attacks, dealing <el>Cosmos DMG</>. Grants <kw>Grain</> on hit.",
				},
				{
					section: "Basic Attack: Blighted Vale",
					description:
						"Press Blighted Vale to throw Brown Sugar Boba to devour the target, dealing <dn>2</> instance of <el>Cosmos DMG</>, granting a certain amount of Grain and Fons. Triggers up to once every <dn>2.5</>s.\nHold Blighted Vale during any instance of Exiled Swordplay attacks to create a branch attack, dealing <dn>2</> instance of <el>Cosmos DMG</> and granting a certain amount of Grain and Fons.\nGrants bonus Fons if this skill defeats the target.\nUp to <dn>250,000</> Fons can be earned this way. Increasing the Tycoon Level to <dn>25</> raises the cap to <dn>500,000</> Fons. Grants <dn>1</> Fons per use once the daily cap is reached. After reaching the total limit, no more Fons can be obtained this way.",
				},
				{
					section: "Basic Attack: Bountiful Grain",
					description:
						"Press Basic Attack while airborne to plunge, dealing <dn>1</> instance of <el>Cosmos DMG</> to an area upon impact, while granting a certain amount of <kw>Grain</>. Increases DMG based on fall height, up to <dn>100%</>.",
				},
				{
					section: "Critical Riposte: Minsky Moment",
					description:
						"Triggers when pressing Basic Attack after a Critical Dodge. Leaps to evade and swings the staff, sending Brown Sugar Boba crashing into the target, dealing <dn>1</> instance of <el>Cosmos DMG</>, reducing Break, and granting <kw>Grain</>.",
				},
			],
			maxLvl: 10,
		},
		skill: {
			name: "Pink Paws Priority Principle",
			description: [
				{
					description:
						"The more, the merrier; the more, the better. Stacks Redirect Skill attempts, up to <dn>3</> stacks.",
				},
				{
					description:
						"Press Redirect Skill to consume <dn>1</> stack and cast No Grain, dealing <el>Cosmos DMG</> once. Press Redirect Skill consecutively to consume stacks and cast No Grain, Half Grain, and Full Grain in order, up to <dn>3</> times in a row.\nPress to cast Pink Paws Priority Principle while in the Surplus state, dealing bonus <el>Cosmos DMG</> based on available Grains using Redirect Skills. Cannot Crit.",
				},
				{
					description:
						"Hold Redirect Skill to consume <dn>2</> stacks and cast No Grain and Half Grain. Continuously consumes Grains while Half Grain is active, dealing consecutive bonus <el>Cosmos DMG</> based on available Grains. Cannot Crit. Consumes all available Grains (including all Grain Loans from the Debt state) when Half Grain ends. Press Redirect Skill again to consume <dn>1</> stack and end Half Grain early, allowing Full Grain to be cast without consuming Grains. Hold Redirect Skill to consume <dn>3</> stacks and use all available Grains (including all Grain Loans from the Debt state). Casts No Grain, Half Grain, and Full Grain in order.\nHold to cast Pink Paws Priority Principle while Surplus is active, dealing bonus <el>Cosmos DMG</> with No Grain based on remaining Grains. Cannot Crit.",
				},
			],
			maxLvl: 10,
		},
		ultimate: {
			name: "Zero-Sum Game",
			description: [
				{
					description:
						"No turning back, max the leverage. Throws Brown Sugar Boba to strike, dealing AoE <el>Cosmos DMG</> once and entering Grain Market for <dn>7</>s. During this time, the first Grain Settlement DMG is guaranteed to Crit.\nConverts all remaining <kw>Grain Loans</> into <kw>Grains</> and enters the <kw>Surplus</> state after casting Zero-Sum Game. Invests all Grains into the Grain Market. Afterward, press Pink Paws Priority Principle to gain Grains based on current <kw>Grain Price</> fluctuations during <kw>Grain Settlement</>. Hold Pink Paws Priority Principle to trigger Grain Settlement once based on the Grain Price on first activation.\nLeaves the Grain Market and prioritizes repaying Grain Loans with all available Grains when Grain Market duration ends.\nGrants access to the Grain Market while in <kw>Debt</> state and holding any Grain Loans.",
				},
			],
			maxLvl: 10,
		},
		support: {
			name: "Temporary Entry",
			description: [
				{
					description:
						"Hope I can m-make it in time…\nBrown Sugar Boba carries Chiz and crashes into the target, dealing <dn>1</> instance of <el>Cosmos DMG</>.",
				},
			],
			maxLvl: 10,
		},
		passive1: {
			name: "Hanahaki Disease",
			description: [
				{
					description:
						"<sh>Charge Enhancement:</> Grants active characters <dn>4</> additional Ultimate Energy.",
				},
			],
			maxLvl: 1,
		},
		passive2: {
			name: "Hoarding",
			description: [
				{
					description:
						"Increases Chiz's Charge Efficiency by <dn>20%</> while on the field.",
				},
			],
			maxLvl: 1,
		},
		lifeSkill1: {
			name: "Lobby Manager",
			description: [
				{
					description:
						"<sh>Level 1:</> Chiz increases traffic by <dn>18</>.",
				},
				{
					description:
						"<sh>Level 2:</> Chiz reduces ingredient consumption rate by <dn>1%</>.",
				},
				{
					description:
						"<sh>Level 3:</> In Owner's Selection, each correct dish (excluding Danzaburou) raises prices. Up to <dn>15</> times per round.",
				},
				{
					description:
						"<sh>Level 4:</> Chiz reduces ingredient consumption rate by <dn>1%</>.",
				},
				{
					description:
						"<sh>Level 5:</> Chiz increases traffic by <dn>27</>.",
				},
			],
			maxLvl: 5,
		},
		lifeSkill2: {
			name: "Nocturnal Animal",
			description: [
				{
					description:
						"<sh>Level 1:</> Highlights global collectibles in Pink Paws Heist.",
				},
			],
			maxLvl: 1,
		},
	},
}
