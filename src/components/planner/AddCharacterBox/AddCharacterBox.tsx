"use client"

import { ChangeEvent, MouseEvent, useState } from "react"
import Image from "next/image"

import { ModalEventType } from "@/types"
import { Character } from "@/types/character"

import { EnumRarity, getItemRarityStyle } from "@/data/items"
import { EnumCharacterElement } from "@/data/characters"
import { getAllCharactersList } from "@/data/characters/characterList"

import { usePlannerStore } from "@/hooks"

import { createSearchString } from "@/helpers"

import { useAddCharContext } from "@/contexts"

import styles from "./addCharacterBox.module.css"

function CharacterListItem({
	char,
	onClick,
}: {
	char: Character
	onClick: (e: MouseEvent<HTMLElement>) => void
}) {
	return (
		<div
			tabIndex={0}
			className={`${styles.charSelectOption} ${getItemRarityStyle(char)}`}
			onClick={onClick}>
			{(char.isPreview || char.isFeatured) && (
				<div className={styles.featureTag}>
					{char.isPreview ? "Preview" : "Featured"}
				</div>
			)}
			<div className={styles.charSelectOptionAvatarContainer}>
				<Image
					className={styles.charSelectOptionAvatar}
					src={`/characters/avatar/${char.imageSrc}`}
					height={256}
					width={256}
					alt={`${char.name} avatar`}
				/>
				<Image
					className={styles.charSelectElement}
					src={`/icons/elements/${char.element}.png`}
					height={64}
					width={64}
					alt={`${char.name} element`}
				/>
			</div>
			<div className={styles.charSelectName}>{char.name}</div>
		</div>
	)
}

export function PlannerAddCharacterBox({
	onCancel,
}: {
	onCancel: (e: ModalEventType) => void
}) {
	const { addCharacter } = useAddCharContext()
	const { plannerData } = usePlannerStore()

	const [searchQuery, setSearchQuery] = useState<string>("")
	const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
		setSearchQuery(e.currentTarget.value)
	}

	const [filterQuery, setFilterQuery] = useState<
		[EnumCharacterElement | null, EnumRarity | null]
	>([null, null])

	const filteredChars = getAllCharactersList().filter((char) => {
		const doesPlannerHaveChar = Object.keys(plannerData.characters).includes(
			char.id
		)
		const matchesElement = !filterQuery[0] || char.element === filterQuery[0]
		const matchesRarity = !filterQuery[1] || char.rarity === filterQuery[1]
		const searchTarget = createSearchString<Character>(char, ["id", "name"])
		const cleanSearchQuery = searchQuery
			.toLowerCase()
			.replaceAll(/[_\s]/g, "")
		const matchesSearch = searchTarget.includes(cleanSearchQuery)

		return (
			!doesPlannerHaveChar &&
			matchesElement &&
			matchesRarity &&
			matchesSearch
		)
	})

	const rarityFilters = Object.values(EnumRarity)
		.filter((value) => typeof value === "number")
		.slice(2)
		.reverse()

	return (
		<div className={styles.addCharBox} onClick={(e) => e.stopPropagation()}>
			<div className={styles.addCharBoxTitle}>Add Character</div>
			<button className={styles.addCharBoxCancel} onClick={onCancel} />
			<div className={styles.addCharFilters}>
				<div className={styles.charFilterList} style={{ flexGrow: 0.25 }}>
					{Object.values(EnumCharacterElement).map((element) => {
						const isActive = filterQuery[0] === element
						const toggleElement = (e: ModalEventType) => {
							e.stopPropagation()
							setFilterQuery(([prevType, prevRank]) => {
								if (prevType === element) return [null, prevRank]
								return [element, prevRank]
							})
						}
						return (
							<span
								key={element}
								tabIndex={0}
								className={`${styles.charFilter} ${isActive ? styles.active : ""}`}
								onClick={toggleElement}
								onKeyDown={(e) => {
									e.stopPropagation()
									if (e.key === "Enter") {
										toggleElement(e)
									}
								}}>
								{isActive ? (
									<Image
										src={`/icons/elements/${element}_white.png`}
										width={64}
										height={64}
										alt={`${element} icon`}
									/>
								) : (
									<Image
										src={`/icons/elements/${element}.png`}
										width={64}
										height={64}
										alt={`${element} icon`}
									/>
								)}
							</span>
						)
					})}
				</div>
			</div>
			<div className={styles.addCharFilters}>
				<div className={styles.charFilterList}>
					{rarityFilters.map((charRank) => {
						const isActive = filterQuery[1] === charRank
						const toggleRank = (e: ModalEventType) => {
							e.stopPropagation()
							setFilterQuery(([prevType, prevRank]) => [
								prevType,
								prevRank === charRank ? null : charRank,
							])
						}

						const rankIcon = (Object.entries(EnumRarity).find(
							([key]) => {
								return key === String(charRank)
							}
						) ?? ["", "rare"])[1]
							.toString()
							.toLowerCase()

						return (
							<span
								key={charRank}
								tabIndex={0}
								className={`${styles.charFilter} ${isActive ? styles.active : ""}`}
								onClick={toggleRank}
								onKeyDown={(e) => {
									e.stopPropagation()
									if (e.key === "Enter") {
										toggleRank(e)
									}
								}}>
								<Image
									src={`/icons/ranks/${rankIcon}.png`}
									width={64}
									height={64}
									alt={`${charRank} icon`}
								/>
							</span>
						)
					})}
				</div>
				<input
					type="text"
					value={searchQuery}
					placeholder="Search"
					className={styles.charFilterSearch}
					onChange={handleSearch}
					onKeyDown={(e) => {
						e.stopPropagation()
						if (e.key === "Enter") {
							e.currentTarget.blur()
						}

						if (e.key === "Escape") {
							if (searchQuery === "") {
								e.currentTarget.blur()
							} else {
								setSearchQuery("")
							}
						}
					}}
				/>
			</div>
			<div className={styles.charSelectList}>
				{filteredChars.map((char) => {
					return (
						<CharacterListItem
							key={char.id}
							char={char}
							onClick={(e) => addCharacter(e, char.id)}
						/>
					)
				})}
			</div>
		</div>
	)
}
