export enum EnumRarity {
  Common = 2,
  Uncommon = 3,
  Rare = 4,
  Epic = 5,
}

export default interface Item {
	id: string,
	name: string;
	description?: string;
	rarity: EnumRarity;
	imageSrc: string;
}