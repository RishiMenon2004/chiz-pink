import type { MetadataRoute } from "next"

import { SITE_DESCRIPTION } from "@/helpers/metadata"

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "Chiz.Pink",
		short_name: "Chiz.Pink",
		description: SITE_DESCRIPTION,
		start_url: "/",
		display: "standalone",
		orientation: "portrait-primary",
		background_color: "#1d1d1d",
		theme_color: "#ff569f",
		icons: [
			{
				src: "/app_icon.png",
				sizes: "512x512",
				type: "image/png",
				purpose: "any",
			},
			{
				src: "/app_icon_maskable.png",
				sizes: "512x512",
				type: "image/png",
				purpose: "maskable",
			},
		],
	}
}
