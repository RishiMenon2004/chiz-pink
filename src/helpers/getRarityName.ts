import { EnumRarity } from "@/data/items"

export function getRarityName(rarity: EnumRarity | number) {
	switch (rarity) {
		default:
		case 2:
		case EnumRarity.Common:
			return "C-Rank"

		case 3:
		case EnumRarity.Uncommon:
			return "B-Rank"

		case 4:
		case EnumRarity.Rare:
			return "A-Rank"

		case 5:
		case EnumRarity.Epic:
			return "S-Rank"
	}
}