import { Character } from "@/types/character"
import { EnumRarity } from "../items"
import { EnumCharacterElement } from "./character"
import { EnumArcType } from "../arcs"
import {
	ascSilhouetteSet,
	hollowflowerSeed,
	talentBirdSet,
	tearOfTheSea,
} from "../items/materials"

export const elyms: Character = {
	id: "elyms",
	imageSrc: "elyms.webp",
	name: "Elyms",
	description:
		"Beep-beep~ Remember to stay in touch with your good friends!",
	rarity: EnumRarity.Epic,
	element: EnumCharacterElement.COSMOS,
	arcType: EnumArcType.Solid,
	ascensionMaterialSet: ascSilhouetteSet,
	ascensionBossMaterial: tearOfTheSea,
	talentMaterialSet: talentBirdSet,
	talentBossMaterial: hollowflowerSeed,
	abilities: {
		basicAttack: {
			name: "Instant Glitch",
			description: [
				{
					section: "Instant Glitch",
					description:
						"A longing for an immediate response.\nElyms's connection has varying levels of Connection Strength. Controls the Dreamworn Terminal to perform up to five consecutive attacks when she is at the Weak Connection level, dealing <el>Cosmos DMG</>.\nAllows Elyms to activate Intermittent Existence directly for a short time after performing the final instance of Instant Glitch.",
				},
				{
					section: "Crosstalk",
					description:
						"A regret that time cannot fade.\nControls the Dreamworn Terminal to perform up to three consecutive attacks when she is at the Medium Connection or Strong Connection level, dealing <el>Cosmos DMG</>.\nAllows Goodbye to You to be activated directly for a limited time after Elyms performs the final instance of Crosstalk while in Medium Connection or Strong Connection.",
				},
				{
					section: "Interference",
					description:
						"It's still a little blurry…\nHold Basic Attack during Instant Glitch while she is at Weak Connection level to trigger Interference, dealing <el>Cosmos DMG</>.",
				},
				{
					section: "Memory Anchor",
					description:
						"Let's… remember it once more…\nPress Aim at any Connection Strength level to cast Memory Anchor, dealing <el>Cosmos DMG</>.",
				},
				{
					section: "Falling Dream",
					description:
						"Falling in a dream once again.\nPress Basic Attack while airborne to plunge, dealing <dn>1</> instance of <el>Cosmos DMG</> to an area upon impact. Increases DMG based on fall height, by up to <dn>100%</>.",
				},
				{
					section: "Okay! Shake on It!",
					description:
						"High five! Fist bump! Friends for life!\nTriggers when pressing Basic Attack after performing a Critical Dodge, dealing <el>Cosmos DMG</>.",
				},
			],
			maxLvl: 10,
		},
		skill: {
			name: "Counting Electric Sheep",
			description: [
				{
					section: "The Ones Who Left",
					description:
						"Like the one yet to arrive.\nControls the Dreamworn Terminal, dealing <el>Cosmos DMG</> to targets in an area.\nAllows Elyms to cast Intermittent Existence directly within a limited time after casting this skill while at Weak Connection.",
				},
				{
					section: "Intermittent Existence",
					description:
						"Continuity is the past pressing ever forward, slowly eroding the future.\nDeals <el>Cosmos DMG</> to targets in an area. Increases her Connection Strength from Weak Connection to Medium Connection after casting Intermittent Existence at Weak Connection. Automatically switches Do You Get Deja Vu between its AoE and single-target forms based on the number of targets within range.\nGrants Optical Illusion for a limited time when her Connection Strength increases from Weak Connection to Medium Connection.",
				},
				{
					section: "Goodbye to You",
					description:
						"The unknown world is a midsummer mirage, and even you are a distant phantom.\nAllows Elyms to activate Goodbye to You directly for a short time after performing the final instance of Crosstalk at Medium Connection or Strong Connection.\nDeals <el>Cosmos DMG</> to targets in an area. Consumes all existing Optical Illusion stacks when cast, increasing this skill's DMG Ratio based on the number consumed.\nAfter casting, advances her Connection Strength to Strong Connection if she is in Medium Connection. Automatically scans nearby targets and switches her Ultimate between its AoE and single-target forms based on the number detected.",
				},
			],
			maxLvl: 10,
		},
		ultimate: {
			name: "Do You Get Deja Vu",
			description: [
				{
					description:
						"The ordinary moments of our lives may be miracles still unfolding.\nWhose fleeting shadow will you glimpse in a scene from yesterday?\n\nFeatures both single-target and AoE forms.\nDefaults to the AoE form at Weak Connection.\nAt Medium Connection or Strong Connection, automatically switches between the two forms based on the target-scan results of the Intermittent Existence, Goodbye to You, and I'm Here while she is active.\nThe DMG Ratio of Do You Get Deja Vu is determined by her Connection Strength at the time of casting. After casting or leaving combat, her Connection Strength resets to Weak Connection.\n\nGrants the whole team an ATK Bonus based on her Base ATK after casting Do You Get Deja Vu, increasing their Follow-up Attack DMG for a limited time.\nGrants the <sh>On the Line</> buff. While this buff is active, <sh>Remembrance</> automatically triggers as a coordinated attack if Elyms is off-field.\n<sh>Remembrance</> takes the same single-target or AoE form as the preceding Do You Get Deja Vu, with its DMG Ratio determined by her Connection Strength when that skill was cast.\n<sh>DMG dealt by Remembrance</> counts as Follow-up Attack DMG.\n<sh>The On the Line</> buff ends when <sh>Remembrance</> reaches its use limit.",
				},
			],
			maxLvl: 10,
		},
		support: {
			name: "I'm Here",
			description: [
				{
					description:
						"Online! Controls the Dreamworn Terminal, dealing <el>Cosmos DMG</>.\nUpgrades her Weak Connection state to Medium Connection after casting I'm Here while she is active. Checks the number of targets within a certain range and automatically switches Do You Get Deja Vu between its single-target and AoE forms accordingly.\nGrants the Optical Illusion for a limited time when Weak Connection is upgraded to Medium Connection.",
				},
			],
			maxLvl: 10,
		},
		passive1: {
			name: "Relay Node",
			description: [
				{
					description:
						"<sh>Charge Enhancement:</> Increases the whole team's <el>Cosmos DMG</> by <dn>3.75%</> for <dn>30</>s whenever the active character gains Ultimate Energy, up to <dn>8</> stacks. Resets the duration when triggered again.\n<sh>Remora Enhancement:</> Causes Elyms to reapply Remora to the same target after <dn>7.5</>s whenever an ally applies Remora. Triggers at most once every <dn>7</>s. Remora applied this way cannot trigger this effect again.",
				},
			],
			maxLvl: 1,
		},
		passive2: {
			name: "Pity System",
			description: [
				{
					description: "Increases her Crit DMG by <dn>10%</>.",
				},
			],
			maxLvl: 1,
		},
		lifeSkill1: {
			name: "Social Network",
			description: [
				{
					description:
						"<sh>Level 1:</> Increases the satisfaction rating for driver-delivered orders by <dn>5</> while Elyms is assigned as a Logistics Assistant at the Logistics Hub.",
				},
				{
					description:
						"<sh>Level 2:</> Increases the maximum number of partner drivers by <dn>1</> while Elyms is assigned as a Logistics Assistant at the Logistics Hub.",
				},
				{
					description:
						"<sh>Level 3:</> Increases the satisfaction rating for driver-delivered orders by <dn>5</> while Elyms is assigned as a Logistics Assistant at the Logistics Hub.",
				},
				{
					description:
						"<sh>Level 4:</> Increases the maximum number of partner drivers by <dn>1</> while Elyms is assigned as a Logistics Assistant at the Logistics Hub.",
				},
				{
					description:
						"<sh>Level 5:</> Increases the number of drivers you can dispatch at once by <dn>1</> while Elyms is assigned as a Logistics Assistant at the Logistics Hub.",
				},
			],
			maxLvl: 5,
		},
		lifeSkill2: {
			name: "Social Connections",
			description: [
				{
					description:
						"<sh>Level 1:</> Going, Going, Gone!: Reduces the collectible cost of the <dn>1</>st furniture exchange at the Collection Showcase by <dn>1</>. (Resets each exchange cycle.)",
				},
				{
					description:
						"<sh>Level 2:</> Effect Changes - Going, Going, Gone!: Reduces the collectible cost of the first <dn>2</> furniture exchanges at the Collection Showcase by <dn>1</>. (Resets each exchange cycle.)",
				},
			],
			maxLvl: 2,
		},
	},
}
