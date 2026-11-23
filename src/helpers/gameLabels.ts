import type { MessageKey, Translate } from "@/types/messages"

import { EnumMaterialType, EnumRarity } from "@/data/items/item"
import { EnumArcType } from "@/data/arcs/arc"
import { EnumCharacterElement } from "@/data/characters/character"

const ELEMENT_KEYS: Record<EnumCharacterElement, MessageKey> = {
	[EnumCharacterElement.COSMOS]: "game.elements.cosmos",
	[EnumCharacterElement.ANIMA]: "game.elements.anima",
	[EnumCharacterElement.INCANTATION]: "game.elements.incantation",
	[EnumCharacterElement.CHAOS]: "game.elements.chaos",
	[EnumCharacterElement.PSYCHE]: "game.elements.psyche",
	[EnumCharacterElement.LAKSHANA]: "game.elements.lakshana",
}

const ARC_TYPE_KEYS: Record<EnumArcType, MessageKey> = {
	[EnumArcType.Solid]: "game.arcTypes.solid",
	[EnumArcType.Liquid]: "game.arcTypes.liquid",
	[EnumArcType.Gas]: "game.arcTypes.gas",
	[EnumArcType.Plasma]: "game.arcTypes.plasma",
	[EnumArcType.Condensate]: "game.arcTypes.condensate",
}

const MATERIAL_TYPE_KEYS: Partial<Record<EnumMaterialType, MessageKey>> = {
	[EnumMaterialType.WeeklyBossDrop]: "game.materialTypes.weeklyBossDrop",
	[EnumMaterialType.BossDrop]: "game.materialTypes.bossDrop",
	[EnumMaterialType.CharacterExp]: "game.materialTypes.characterExp",
	[EnumMaterialType.CharacterAscension]: "game.materialTypes.characterAscension",
	[EnumMaterialType.Talent]: "game.materialTypes.talent",
	[EnumMaterialType.WeaponAscension]: "game.materialTypes.weaponAscension",
	[EnumMaterialType.WeaponExp]: "game.materialTypes.weaponExp",
	[EnumMaterialType.Substitute]: "game.materialTypes.substitute",
	[EnumMaterialType.Currency]: "game.materialTypes.currency",
	[EnumMaterialType.Reward]: "game.materialTypes.reward",
}

export function getRankLabel(rarity: EnumRarity | number, t: Translate): string {
	switch (rarity) {
		case EnumRarity.Uncommon:
			return t("game.ranks.uncommon")
		case EnumRarity.Rare:
			return t("game.ranks.rare")
		case EnumRarity.Epic:
			return t("game.ranks.epic")
		case EnumRarity.Common:
		default:
			return t("game.ranks.common")
	}
}

export function getElementLabel(
	element: EnumCharacterElement,
	t: Translate,
): string {
	return t(ELEMENT_KEYS[element])
}

export function getArcTypeLabel(arcType: EnumArcType, t: Translate): string {
	return t(ARC_TYPE_KEYS[arcType])
}

export function getMaterialTypeLabel(
	type: EnumMaterialType,
	t: Translate,
): string {
	const key = MATERIAL_TYPE_KEYS[type]
	return key ? t(key) : type
}

export function getArcName(
	arc: { id: string; name: string },
	t: Translate,
): string {
	const key = `arcs.${arc.id}` as MessageKey
	const translated = t(key)
	return translated === key ? arc.name : translated
}

export function getItemDisplayName(
	item: { id: string; name: string; effect?: unknown },
	t: Translate,
): string {
	return "effect" in item ? getArcName(item, t) : item.name
}

export function getActivityName(
	activity: { id: string; name: string },
	t: Translate,
): string {
	if (activity.id === "city_stamina") return t("game.cityStamina")
	const key = `checklist.tasks.${activity.id}.name` as MessageKey
	const translated = t(key)
	return translated === key ? activity.name : translated
}

export function getActivityDescription(
	activity: { id: string; description: string },
	t: Translate,
): string {
	const key = `checklist.tasks.${activity.id}.description` as MessageKey
	const translated = t(key)
	return translated === key ? activity.description : translated
}

export function getMaterialName(
	material: { id: string; name: string },
	t: Translate,
): string {
	const key = `materials.names.${material.id}` as MessageKey
	const translated = t(key)
	return translated === key ? material.name : translated
}

function sourceToKey(source: string): string {
	return source
		.toLowerCase()
		.replace(/['"]/g, "")
		.replace(/[^a-z0-9]+/g, "_")
		.replace(/^_|_$/g, "")
}

export function getMaterialSourceLabel(source: string, t: Translate): string {
	const key = `materials.sources.${sourceToKey(source)}` as MessageKey
	const translated = t(key)
	return translated === key ? source : translated
}
