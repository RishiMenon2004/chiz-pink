"use client"

import Image, { type ImageProps } from "next/image"

import type { Character } from "@/types/character"

const PLACEHOLDER_SRC = "/characters/avatar/placeholder.png"

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
				if (target.src.endsWith(PLACEHOLDER_SRC)) return
				target.src = PLACEHOLDER_SRC
			}}
			{...imageProps}
		/>
	)
}
