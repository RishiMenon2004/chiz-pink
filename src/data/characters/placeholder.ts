import type { Ability, CharacterAbilitySet } from "@/types/character"

const tbd = (name: string, maxLvl: number): Ability => ({
	name,
	description: [{ description: "Details to be announced." }],
	maxLvl,
})

export const placeholderAbilities: CharacterAbilitySet = {
	basicAttack: tbd("Basic Attack", 10),
	skill: tbd("Skill", 10),
	ultimate: tbd("Ultimate", 10),
	support: tbd("Support", 10),
	passive1: tbd("Passive I", 1),
	passive2: tbd("Passive II", 1),
	lifeSkill1: tbd("Life Skill", 5),
}
