"use client"

import Image, { type ImageProps } from "next/image"

import type { Material } from "@/types/item"

const PLACEHOLDER_SRC = "/materials/placeholder.png"

type MaterialIconProps = Omit<ImageProps, "src" | "alt"> & {
	alt?: string
	material: Material
}

// Falls back to a placeholder icon if the real one fails to load -- most
// notably when offline and viewing a material that was never fetched
// (and therefore never cached) while online.
export function MaterialIcon({
	material,
	alt,
	...imageProps
}: MaterialIconProps) {
	return (
		<Image
			src={`/materials${material.imageSrc}.png`}
			alt={alt ?? `${material.id} icon`}
			onError={(e) => {
				const target = e.currentTarget
				if (target.src.endsWith(PLACEHOLDER_SRC)) return
				target.src = PLACEHOLDER_SRC
			}}
			{...imageProps}
		/>
	)
}
