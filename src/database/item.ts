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

export enum EnumItemLvls {
	Lvl1 = 1,
	Lvl20 = 20,
	Lvl20A = 21,
	Lvl30 = 30,
	Lvl30A = 31,
	Lvl40 = 40,
	Lvl40A = 41,
	Lvl50 = 50,
	Lvl50A = 51,
	Lvl60 = 60,
	Lvl60A = 61,
	Lvl70 = 70,
	Lvl70A = 71,
	Lvl80 = 80,
}

export const getItemRarityStyle = (
	item: Item,
	styleSheet: { readonly [key: string]: string }
) => {
	switch (item.rarity) {
		default:
			return styleSheet.common
		case 3:
			return styleSheet.uncommon
		case 4:
			return styleSheet.rare
		case 5:
			return styleSheet.epic
	}
}

export default interface Item {
	id: string
	name: string
	description?: string
	rarity: EnumRarity
	imageSrc: string
}
