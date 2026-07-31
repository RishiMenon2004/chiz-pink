"use client"

import Image, { type ImageProps } from "next/image"

import type { Arc } from "@/types/weapon"

const PLACEHOLDER_SRC = "/arcs/placeholder.webp"

type ArcIconProps = Omit<ImageProps, "src" | "alt"> & {
	alt?: string
	arc: Arc
}

// Falls back to a placeholder icon if the real one fails to load -- most
// notably when offline and viewing an arc that was never fetched
// (and therefore never cached) while online.
export function ArcIcon({ arc, alt, ...imageProps }: ArcIconProps) {
	return (
		<Image
			src={`/arcs/${arc.imageSrc}`}
			alt={alt ?? `${arc.id} icon`}
			onError={(e) => {
				const target = e.currentTarget
				if (target.src.endsWith(PLACEHOLDER_SRC)) return
				target.src = PLACEHOLDER_SRC
			}}
			{...imageProps}
		/>
	)
}
