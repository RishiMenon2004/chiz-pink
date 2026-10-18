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

export const akane: Character = {
	isPreview: true,
	id: "akane",
	imageSrc: "akane.webp",
	name: "Akane Rin",
	description: "You should be saving energy when offstage.",
	rarity: EnumRarity.Epic,
	element: EnumCharacterElement.LAKSHANA,
	arcType: EnumArcType.Liquid,
	ascensionMaterialSet: ascDelusionsSet,
	ascensionBossMaterial: chargingKnightSparkPlug,
	talentMaterialSet: talentHeartSet,
	talentBossMaterial: goodBoyStamp,
	abilities: {
		basicAttack: {
			name: "Stringblade",
			description: [
				{
					section: "Basic Attack: Stringblade",
					description:
						"Performs <dn>4</> consecutive attacks using an electric guitar and Feathered Sound Blade, dealing Lakshana DMG. Generates <kw>String Energy</> whenever Akane Rin deals DMG to a target. <kw>String Energy</> has a cap of <dn>30</>.",
				},
				{
					section: "Basic Attack: Stage Dive",
					description:
						"Press Basic Attack while airborne to plunge, dealing <dn>1</> instance of Lakshana DMG in an area upon impact.",
				},
				{
					section: "Critical Riposte: Featherblade Reverb",
					description:
						"Triggers when pressing Basic Attack after a Critical Dodge. Blasts the target with Feathered Sound Blade, dealing Lakshana DMG.",
				},
			],
			maxLvl: 10,
		},
		skill: {
			name: "Rhythm Wave",
			description: [
				{
					description:
						"Offers two casting methods for Akane Rin's Rhythm Wave.\nPress: Inflicts Overtone on the target for <dn>25</>s and deals Lakshana DMG. Causes Overtone to resonate when Akane Rin performs a Basic Attack, relaying that Basic Attack over long range to the affected target and increasing the relayed Basic Attack's DMG Ratio by <dn>32.5%</>.\nHold: Deploys a Reverb Field for <dn>25</>s and deals Lakshana DMG to enemies within range. Causes Reverb Field to resonate when Akane Rin performs a Basic Attack, relaying that Basic Attack through the field to deal <dn>1</> instance of Basic Attack DMG to all enemies within range and increasing the relayed Basic Attack's DMG by an additional <dn>36%</>.\nAllows only one Overtone or Reverb Field to exist at a time. Replaces the existing form when a new form is successfully established. Shares the same cooldown between both casting methods and allows either form to be selected again once the cooldown ends.\nEnables Synced Resonance when String Energy reaches <dn>30</> and an active Overtone or Reverb Field is present. Triggers an enhanced effect based on the current form:\nOvertone: deals <dn>1</> instance of massive single-target Lakshana DMG to the affected target.\nReverb Field: deals <dn>1</> instance of enhanced Spread Lakshana DMG to enemies within range.\nConsumes <dn>30</> String Energy when Synced Resonance hits and consumes none if it misses. Preserves the existing Overtone or Reverb Field without refreshing its remaining duration.\nSynced Resonance has no independent cooldown and does not affect Rhythm Wave's normal cooldown.\nPrevents Synced Resonance from being cast when neither Overtone nor Reverb Field is active, requiring Rhythm Wave to establish a form first.",
				},
			],
			maxLvl: 10,
		},
		ultimate: {
			name: "Sonic Boom",
			description: [
				{
					description:
						"Casts the first stage of Sonic Boom, dealing <dn>1</> instance of massive Lakshana DMG to enemies within the target area and entering Solo Cadenza for <dn>X</>s. Allows the second stage to be cast at any time during the latter half of Solo Cadenza by pressing the Ultimate again, dealing <dn>1</> instance of massive Lakshana DMG to enemies within the target area. Requires the second stage to be cast manually. Does not automatically cast the second stage when Solo Cadenza ends. Solo Cadenza functions independently of Overtone and Reverb Field and does not remove or replace either effect.",
				},
			],
			maxLvl: 10,
		},
		support: {
			name: "Altered Chord",
			description: [
				{
					description:
						"Strikes the strings with a powerful strum, dealing 1 instance of Lakshana DMG and triggering a Reaction.",
				},
			],
			maxLvl: 10,
		},
		passive1: {
			name: "Perfect Pitch",
			description: [
				{
					description:
						"<sh>Remora  Enhancement:</> Grants Akane Rin an enhancement that lasts until she leaves combat after the team triggers Remora for the first time. Applies Remora to the target affected by Overtone and to all enemies within Reverb Field every <dn>X</>s.\nDeals Lakshana DMG equal to <dn>X%</> of Akane Rin's ATK whenever the team reapplies Remora to an affected target. Increases this DMG by <dn>X%</> for each <dn>1</>s of Remora duration remaining on the target, up to X%.\nCalculates each target's remaining Remora duration independently. Triggers this DMG no more than <dn>once</> per target every <dn>X</>s.",
				},
			],
			maxLvl: 1,
		},
		passive2: {
			name: "Starlit Anthem",
			description: [
				{
					description:
						"Increases Akane Rin's DMG dealt by <dn>20%</> for <dn>25</>s after casting Sonic Boom. Effect does not stack. Resets the duration when triggered again.",
				},
			],
			maxLvl: 1,
		},
		lifeSkill1: {
			name: "House Special",
			description: [
				{
					description:
						"<sh>Level 1:</> Akane increases traffic by <dn>18</>.",
				},
				{
					description:
						"<sh>Level 2:</> Akane reduces ingredient consumption rate by <dn>1%</>",
				},
				{
					description:
						"<sh>Level 3:</> Akane increases traffic by <dn>18</>.",
				},
				{
					description:
						"<sh>Level 4:</> Akane reduces ingredient consumption rate by <dn>1%</>.",
				},
				{
					description:
						"<sh>Level 5:</> Akane increases traffic by <dn>27</>.",
				},
			],
			maxLvl: 5,
		},
		lifeSkill2: {
			name: "Shining Idol",
			description: [
				{
					description:
						"<sh>Level 1:</> Super Sound costs an extra <dn>1</> City Stamina per run.",
				},
				{
					description:
						"<sh>Level 2:</> Super Sound costs an extra <dn>1</> City Stamina per run.",
				},
			],
			maxLvl: 2,
		},
	},
}
