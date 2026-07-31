"use client"

import Image, { type ImageProps } from "next/image"

import type { Character } from "@/types/character"
import { EnumCharacterElement } from "@/data/characters"

const CHAR_PLACEHOLDER_SRC = "/characters/avatar/placeholder.webp"

type CharacterAvatarProps = Omit<ImageProps, "src" | "alt"> & {
	alt?: string
	character: Character
}

// Falls back to a placeholder icon if the real one fails to load -- most
// notably when offline and viewing a character that was never fetched
// (and therefore never cached) while online.
export function CharacterAvatar({
	character,
	alt,
	...imageProps
}: CharacterAvatarProps) {
	return (
		<Image
			src={`/characters/avatar/${character.imageSrc}`}
			alt={alt ?? `${character.id} avatar`}
			onError={(e) => {
				const target = e.currentTarget
				if (target.src.endsWith(CHAR_PLACEHOLDER_SRC)) return
				target.src = CHAR_PLACEHOLDER_SRC
			}}
			{...imageProps}
		/>
	)
}

type CharacterElementProps = Omit<ImageProps, "src" | "alt"> & {
	alt?: string
	active?: boolean
	element: EnumCharacterElement
}

export function CharacterElement({
	element,
	active,
	...imageProps
}: CharacterElementProps) {
	return active ? (
		<Image
			src={`/icons/elements/${element}_white.png`}
			alt={`${element} icon`}
			{...imageProps}
		/>
	) : (
		<Image
			src={`/icons/elements/${element}.png`}
			alt={`${element} icon`}
			{...imageProps}
		/>
	)
}
