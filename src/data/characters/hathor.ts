import { Character } from "@/types/character"

import { EnumRarity } from "@/data/items"
import {
	ascDelusionsSet,
	colorfulTicketStub,
	goodBoyStamp,
	talentHeartSet,
} from "@/data/items/materials"
import { EnumArcType } from "@/data/arcs"
import { EnumCharacterElement } from "@/data/characters"

export const hathor: Character = {
	id: "hathor",
	imageSrc: "hathor.png",
	name: "Hathor",
	description:
		"An efficient courier who enjoys creating comprehensive task schedules and strictly executing them to completion.",
	rarity: EnumRarity.Epic,
	element: EnumCharacterElement.LAKSHANA,
	arcType: EnumArcType.Plasma,
	ascensionMaterialSet: ascDelusionsSet,
	ascensionBossMaterial: colorfulTicketStub,
	talentMaterialSet: talentHeartSet,
	talentBossMaterial: goodBoyStamp,
	abilities: {
		basicAttack: {
			name: "Rapid Delivery",
			description: [
				{
					section: "Basic Attack: Rapid Delivery",
					description:
						"Displays superior martial arts, performing up to <dn>5</> consecutive attacks, dealing Lakshana DMG.",
				},
				{
					section: "Basic Attack: Final Dispatch",
					description:
						"Plunges from the air, dealing <dn>1</> instance of Lakshana DMG to an area upon impact. Increases DMG based on fall height, up to 100%.",
				},
				{
					section: "Basic Attack: To The Skies",
					description:
						"Hold Basic Attack to trigger. Sweeps around the target at high speed to knock them up, then restrains and plunges, dealing <dn>1</> instance of Lakshana DMG to an area on impact. Performs Final Dispatch if the target cannot be knocked up.",
				},
				{
					section: "Critical Riposte: Zero-Error Operation",
					description: "Triggers when using Rapid Delivery after a Critical Dodge. Launches a lightning-fast counterattack, dealing <dn>1</> instance of Lakshana DMG to an area, reducing Break, and gaining Express Delivery Power on hit (up to <dn>1</> stack every <dn>5</>s)."
				}
			],
			maxLvl: 10,
		},
		skill: {
			name: "Aerial Command",
			description: [
				{
					section: "Redirect Skill: Aerial Command",
					description:
						"Target locked, time to wrap this up quickly. Leaps into the air and slashes the target in front with wings, gaining <dn>2</> stacks of Express Delivery Power.\nHold to enter charge status, increasing the power of Aerial Command and inflicting targets in range with Five-Star Tracking effect. The charge lasts up to 5s, during which Hathor constantly deals AoE Lakshana DMG while the skill range gradually expands. The effect ends when the skill button is released, concluding the charging phase.\n<sh>Five-Star Tracking</>\nLasts for 5s. Grants 3 stacks of Express Delivery Power when the target attacks or hits Hathor or an ally during this time.",
				},
				{
					section: "Redirect Skill: Cyclone Strike",
					description:
						"Consumes Express Delivery Power to cast this skill while in Emergency Delivery status. Summons a motorcycle of thorns and unleashes a rapid combo on the target. Increases DEF while the skill is active.",
				},
			],
			maxLvl: 10,
		},
		ultimate: {
			name: "Rider Express",
			description: [
				{
					description:
						"Get out of the way. Summons a motorcycle made of thorns and circles around targets, charging at enemies ahead with increased speed. Launches into the air and dive-bombs the ground, dealing <dn>1</> instance of Lakshana DMG to an area.\nEnters <kw>Emergency Delivery</> state for a period after skill activation and stops gaining Express Delivery Power. Upgrades Aerial Command to Cyclone Strike in this state. Increases Movement Speed and grants ATK bonus based on Express Delivery Power stacks. Ends <kw>Emergency Delivery</> state immediately when switching characters during this period.",
				},
			],
			maxLvl: 10,
		},
		support: {
			name: "Impact Point Designation",
			description: [
				{
					description:
						"The time has come. Strikes from the air, kicking the target to trigger an impact, dealing <dn>2</> instances of Lakshana DMG to an area.",
				},
			],
			maxLvl: 10,
		},
		passive1: {
			name: "Delay Warning",
			description: [
				{
					description:
						"<sh>Remora Enhancement:</> Extends the target's Remora duration to 12s and increases Crit Rate by 10% when allies attacking a target affected by Remora.",
				},
			],
			maxLvl: 1,
		},
		passive2: {
			name: "Efficiency Boost",
			description: [
				{
					description:
						"Grants <dn>1</> stack of Express Delivery Power after defeating a target.",
				},
			],
			maxLvl: 1,
		},
		lifeSkill1: {
			name: "Elite Courier",
			description: [
				{
					description:
						"<sh>Level 1:</> Increases delivery points for City Delivery by <dn>2</> per day.",
				},
				{
					description:
						"<sh>Level 2:</> Increases customer satisfaction for City Delivery by an additional <dn>10</> points.",
				},
				{
					description:
						"<sh>Level 3:</> Increases delivery points for City Delivery by <dn>2</> per day.",
				},
				{
					description:
						"<sh>Level 4:</> Increases customer satisfaction for City Delivery by an additional <dn>10</> points.",
				},
				{
					description:
						"<sh>Level 5:</> Hathor can help complete <dn>1</> City Delivery per day and directly obtain the rewards.",
				},
			],
			maxLvl: 5,
		},
	},
}
