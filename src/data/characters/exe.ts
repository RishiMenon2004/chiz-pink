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
	// The game data (1.5.4) is unfinished ahead of his phase 2 banner: no
	// profile text, life skills untranslated, numbers missing in Passive II.
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
		basicAttack: {
			name: "Brute-Force Hacking",
			description: [
				{
					section: "Basic Attack: Brute-Force Hacking",
					description:
						"Restore. A direct approach is more efficient. Commands the Hand of Y to perform up to <dn>5</> consecutive attacks, dealing <el>Chaos DMG</>. The final instance can consume <dn>10</> Frames to generate <dn>1</> Digital Echo.",
				},
				{
					section: "Basic Attack: Vertical Breach",
					description:
						"Root access granted. Vertical breach initiated. Press Basic Attack while airborne to plunge, dealing <dn>1</> instance of <el>Chaos DMG</> upon impact. Increases DMG based on fall height, up to <dn>100%</>.",
				},
				{
					section: "Basic Attack: Network Penetration",
					description:
						"Attack. Multiple layers of defense detected. Speedrun. Triggers Network Penetration by holding Basic Attack during Special Combat Arts, dealing <el>Chaos DMG</>. During Shader Compile, Network Penetration targets the non-Boss enemy with the lowest HP and executes them if their HP is below <dn>15%</>, extending Shader Compile by Xs.",
				},
				{
					section: "Critical Riposte: Zero-Latency Response",
					description:
						"Invincibility frames. Timing windows aligned. Flawless execution. Score recorded. Triggers when using Brute-Force Hacking after a Critical Dodge. Commands the Hand of Y to deal <dn>1</> instance of <el>Chaos DMG</> and reduce the target's Break by an additional amount. Gains Frames and can spend <dn>10</> Frames to generate <dn>1</> Digital Echo.",
				},
			],
			maxLvl: 10,
		},
		skill: {
			name: "Data Exfiltration",
			description: [
				{
					description:
						"localhost session established. Firewall breached. Scanning for target…\nTarget terminated. Redirecting…\nCommands the Hand of Y to deal multiple instances of <el>Chaos DMG</> and generate up to <dn>5</> Digital Echoes based on Exe's current Frames.",
				},
			],
			maxLvl: 10,
		},
		ultimate: {
			name: "Mesh Collision",
			description: [
				{
					description:
						"Error: Target address is null.\n// Exit the secret base and return to reality.\nreturn NULL\nReconstructs reality digitally and enters Shader Compile, commanding the Hand of Y to unleash multiple attacks that deal massive <el>Chaos DMG</> to targets in range. Generates multiple Digital Echoes based on his current Frames.\nShader Compile lasts Xs. While active, any of Exe's attacks can consume Frames to generate Digital Echoes.",
				},
			],
			maxLvl: 10,
		},
		support: {
			name: "Remote Control",
			description: [
				{
					description:
						"Exe activates Remote Control, directing streams of data to bind the target. Triggers a data surge upon entering the field, dealing <dn>1</> instance of <el>Chaos DMG</>. Allows him to spend <dn>10</> Frames to generate <dn>1</> Digital Echo.",
				},
			],
			maxLvl: 10,
		},
		passive1: {
			name: "Extra Score",
			description: [
				{
					description:
						"<sh>Nova Enhancement:</> Immediately raises Exe's Rating to SS when he triggers Nova while below SS.",
				},
			],
			maxLvl: 1,
		},
		passive2: {
			name: "Burst Overclock",
			description: [
				{
					description:
						"Reduces Exe's Redirect Skill cooldown by <dn>X</>s whenever a Digital Echo's attack deals DMG. Does not trigger if the remaining cooldown is below <dn>X</>s.\nGrants Exe a stack of <dn>X%</> DMG Bonus whenever an allied summon deals DMG. Each summon can grant up to <dn>X</> stacks, with a total cap of <dn>X</> stacks. The buff lasts until the end of battle.",
				},
			],
			maxLvl: 1,
		},
		lifeSkill1: placeholderAbilities.lifeSkill1,
	},
}
