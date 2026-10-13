import { Character } from "@/types/character"
import { EnumRarity } from "../items"
import { EnumCharacterElement } from "./character"
import { EnumArcType } from "../arcs"
import {
	ascNumeralSet,
	colorfulTicketStub,
	eternalMemory,
	talentTarotSet,
} from "../items/materials"

export const blackbird: Character = {
	isFeatured: true,
	id: "blackbird",
	imageSrc: "blackbird.webp",
	name: "Blackbird",
	description:
		"The owner of The Witch's House, an elusive and elegant witch.",
	rarity: EnumRarity.Epic,
	element: EnumCharacterElement.PSYCHE,
	arcType: EnumArcType.Gas,
	ascensionMaterialSet: ascNumeralSet,
	ascensionBossMaterial: colorfulTicketStub,
	talentMaterialSet: talentTarotSet,
	talentBossMaterial: eternalMemory,
	abilities: {
		basicAttack: {
			name: "Fleeting Shadow",
			description: [
				{
					section: "Basic Attack: Fleeting Shadow",
					description:
						"Uses Chain Cage to perform up to 5 consecutive attacks, dealing Psyche DMG. Gains <kw>Malice</> after hitting an enemy.",
				},
				{
					section: "Basic Attack: Roostcall",
					description:
						"Hold Basic Attack during the 1st, 2nd, or 3rd hit of Fleeting Shadow to trigger Roostcall, imprisoning the target with Chain Cage, dealing Psyche DMG, and greatly reducing their Movement Speed for a set duration. Gains <kw>Malice</> after hitting an enemy.",
				},
				{
					section: "Basic Attack: Lingering Affliction",
					description:
						"Press Basic Attack while airborne to plunge, dealing 1 instance of Psyche DMG to an area upon impact. Increases DMG based on fall height by up to 100%. Gains <kw>Malice</> after hitting an enemy.",
				},
				{
					section: "Critical Riposte: Avian Instinct",
					description:
						"Triggers when Blackbird uses Fleeting Shadow after a Critical Dodge, attacking the target to deal Psyche DMG. Gains <kw>Malice</> after hitting an enemy.",
				},
				{
					section: "Basic Attack: Pyreflame",
					description:
						"Blackbird is engulfed in flames, and the <kw>Witch of Deliverance</> emerges from the blaze, unleashing up to 5 consecutive attacks that deal Psyche DMG. Consumes <kw>Malice</> after hitting an enemy.",
				},
				{
					section: "Basic Attack: Bestowed Grace",
					description:
						"Hold Basic Attack during the 2nd hit of Pyreflame to trigger Bestowed Grace. The <kw>Witch of Deliverance</> rises into the air, briefly charges up, then deals Psyche DMG over a large area. Consumes <kw>Malice</> after hitting an enemy.",
				},
				{
					section: "Basic Attack: Tidings Unto All",
					description:
						"Hold Basic Attack during Bestowed Grace or Flames of Deliverance to trigger Tidings Unto All, dealing multiple instances of Psyche DMG to the target. Consumes <kw>Malice</> after hitting an enemy.",
				},
				{
					section: "Basic Attack: Searing Scar",
					description:
						"Press Basic Attack while the <kw>Witch of Deliverance</> is airborne to plunge, dealing 1 instance of Psyche DMG to an area upon impact. Increases DMG based on fall height, by up to 100%. Consumes <kw>Malice</> after hitting an enemy.",
				},
				{
					section: "Critical Riposte: Born of Calamity",
					description:
						"Triggers when the <kw>Witch of Deliverance</> uses Pyreflame after a Critical Dodge, attacking the target to deal Psyche DMG. Consumes <kw>Malice</> after hitting an enemy.",
				},
				{
					section: "Invocation",
					description:
						"Generates varying amounts of <kw>Malice</> upon casting Fleeting Shadow, Roostcall, Lingering Affliction, Avian Instinct, Last Word, or Netherplume Rite.\nGrants <kw>Malice</> immediately upon entering battle.\nPrevents <kw>Malice</> from being gained while in the <kw>Witch of Deliverance</> state. Allows <kw>Malice</> to be consumed after casting Pyreflame, Searing Scar, Bestowed Grace, Tidings Unto All, Born of Calamity, Flames of Deliverance, or Naught but Mercy to deal additional <kw>Malice</> DMG.",
				},
			],
			maxLvl: 10,
		},
		skill: {
			name: "Netherplume Rite",
			description: [
				{
					description:
						"Uses Chain Cage to deal Psyche DMG to the target and inflict a <kw>Forsaken Feather</> mark on targets hit for a set duration. Casts to gain <kw>Malice</>.\nWhile <kw>Forsaken Feather</> is active, triggers <kw>Forsaken Bird</> to perform a coordinated attack when another active ally deals DMG to the marked target. <kw>Forsaken Bird</> deals Psyche DMG in an area around the target. Triggers no more than once every 2s, up to 5 times in total.",
				},
				{
					section: "Flames of Deliverance",
					description:
						"Charges toward the target at high speed while Blackbird is in the <kw>Witch of Deliverance</> state, dealing Psyche DMG. Consumes <kw>Malice</> after hitting an enemy.\nActivation: Activates after <kw>Witch of Deliverance</> performs the 5th hit of Pyreflame or casts No Quarter. This skill is inactive by default.",
				},
			],
			maxLvl: 10,
		},
		ultimate: {
			name: "Requies Animarum",
			description: [
				{
					description:
						"Transforms into the Witch of Deliverance and launches multiple attacks, dealing massive Psyche DMG to the target.\nGains Hitstun Immunity and increases Movement Speed while in the Witch of Deliverance state, which lasts for a set duration. Reverts to Blackbird when the duration ends. The duration does not decrease while she is off-field.\nIncreases the entire team's ATK after casting Requies Animarum.",
				},
				{
					section: "Flammae in Unum",
					description:
						"Exits the <kw>Witch of Deliverance</> state and launches multiple attacks against the target, dealing massive Psyche DMG.",
				},
			],
			maxLvl: 10,
		},
		support: {
			name: "Judgment Upon Me",
			description: [
				{
					description:
						"The bird will deliver everything it finds to me. Transforms into Lonesome Bird and deals Psyche DMG to the target. Gains <kw>Malice</> after hitting an enemy.",
				},
				{
					section: "Naught but Mercy",
					description:
						"Accept the Witch's blessing. Deals Psyche DMG while in the <kw>Witch of Deliverance</> state. Consumes <kw>Malice</> after hitting an enemy.",
				},
			],
			maxLvl: 10,
		},
		passive1: {
			name: "Thrushsong",
			description: [
				{
					description:
						"<sh>Stain Enhancement:</> Increases Stain's base DMG Bonus to <dn>30%</> and extends its duration to <dn>20</>s.",
				},
				{
					description:
						"<sh>Nova  Enhancement:</>  When Nova ends, deals additional Mental DMG equal to <dn>20%</> of the actual total DMG taken by the target while Nova was active (excluding DMG dealt by the Support Skill that triggered Nova and by Nova itself), up to <dn>1,000×</> Blackbird's Base ATK. This additional DMG is not affected by any other DMG Buffs or Debuffs. Inflicts Nova on the target once afterward.\nPrevents Nova inflicted by this effect from triggering the Nova reapplication effect again.",
				},
			],
			maxLvl: 1,
		},
		passive2: {
			name: "Ever Onward",
			description: [
				{
					description:
						"Grants <dn>20</> <kw>Malice</> when Blackbird casts Judgment Upon Me.",
				},
			],
			maxLvl: 1,
		},
		lifeSkill1: {
			name: "Lucky Encore",
			description: [
				{
					description: "<sh>Level 1:</> Increases daily Bless attempts in The Witch's House Divination by <dn>1</>.\nA new Bless effect replaces the existing one.",
				},
				{
					description:
						"<sh>Level 2:</> Increases daily Lost Tales attempts in The Witch's House Divination by <dn>1</>",
				},
				{
					description: "<sh>Level 3:</> Increases daily Bless attempts in The Witch's House Divination by <dn>1</>.\nA new Bless effect replaces the existing one.",
				},
				{
					description:
						"<sh>Level 4:</> Increases daily Treasure Hunt attempts in The Witch's House Divination by <dn>1</>.",
				},
				{
					description: "<sh>Level 5:</> Increases daily Bless attempts in The Witch's House Divination by <dn>1</>.\nA new Bless effect replaces the existing one.",
				},
			],
			maxLvl: 5,
		},
		lifeSkill2: {
			name: "Now You Don't",
			description: [
				{
					description:
						"<sh>Level 1:</> Costs <dn>1</> additional City Stamina per Shadow-n-Seek match.",
				},
				{
					description:
						"<sh>Level 2:</> Costs <dn>1</> additional City Stamina per Shadow-n-Seek match.",
				},
			],
			maxLvl: 2,
		},
	},
}
