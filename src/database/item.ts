export enum EnumRarity {
	Common = 2,
	Uncommon = 3,
	Rare = 4,
	Epic = 5,
}

export enum EnumStatAttribute {
	ATK = "ATK",
	ATKBonus = "ATK%",
	UniversalDMGBonus = "DMG%",
	HP = "HP",
	HPBonus = "HP%",
	DEF = "DEF",
	DEFBonus = "DEF%",
	CritRate = "CRIT Rate",
	CritDMG = "CRIT DMG",
	CycleIntensity = "Cycle Intensity",
	BreakIntensity = "Break Intensity",
	HealingBonus = "Healing Bonus",
	CosmosDMGBonus = "Cosmos DMG Bonus",
	AnimaDMGBonus = "Anima DMG Bonus",
	IncantationDMGBonus = "Incantation DMG Bonus",
	ChaosDMGBonus = "Chaos DMG Bonus",
	PsycheDMGBonus = "Psyche DMG Bonus",
	MentalDMGBonus = "Mental DMG Bonus",
	ChargeEffeciency = "Charge Efficiency",
}

export default interface Item {
	id: string
	name: string
	description?: string
	rarity: EnumRarity
	imageSrc: string
}
