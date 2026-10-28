import type { MetadataRoute } from "next"

import { getAllCharactersList } from "@/data/characters"
import { getAllArcsList } from "@/data/arcs"

import { SITE_URL } from "@/helpers/metadata"

export default function sitemap(): MetadataRoute.Sitemap {
	const baseUrl = SITE_URL
	const now = new Date()

	const staticRoutes: MetadataRoute.Sitemap = [
		{
			url: baseUrl,
			lastModified: now,
			changeFrequency: "daily",
			priority: 1.0,
		},
		{
			url: `${baseUrl}/checklist`,
			lastModified: now,
			changeFrequency: "daily",
			priority: 0.8,
		},
		{
			url: `${baseUrl}/planner`,
			lastModified: now,
			changeFrequency: "weekly",
			priority: 0.8,
		},
		{
			url: `${baseUrl}/inventory`,
			lastModified: now,
			changeFrequency: "weekly",
			priority: 0.8,
		},
		{
			url: `${baseUrl}/planner/characters`,
			lastModified: now,
			changeFrequency: "weekly",
			priority: 0.9,
		},
		{
			url: `${baseUrl}/planner/arcs`,
			lastModified: now,
			changeFrequency: "weekly",
			priority: 0.9,
		},
		{
			url: `${baseUrl}/characters`,
			lastModified: now,
			changeFrequency: "weekly",
			priority: 0.8,
		},
		{
			url: `${baseUrl}/arcs`,
			lastModified: now,
			changeFrequency: "weekly",
			priority: 0.8,
		},
		{
			url: `${baseUrl}/pulls`,
			lastModified: now,
			changeFrequency: "weekly",
			priority: 0.7,
		},
		{
			url: `${baseUrl}/settings`,
			lastModified: now,
			changeFrequency: "monthly",
			priority: 0.5,
		},
		{
			url: `${baseUrl}/privacy`,
			lastModified: now,
			changeFrequency: "yearly",
			priority: 0.3,
		},
	]

	const characterRoutes: MetadataRoute.Sitemap = getAllCharactersList().map(
		(char) => ({
			url: `${baseUrl}/characters/${char.id}`,
			lastModified: now,
			changeFrequency: "weekly",
			priority: 0.7,
		})
	)

	const arcRoutes: MetadataRoute.Sitemap = getAllArcsList().map((arc) => ({
		url: `${baseUrl}/arcs/${arc.id}`,
		lastModified: now,
		changeFrequency: "weekly",
		priority: 0.7,
	}))

	return [...staticRoutes, ...characterRoutes, ...arcRoutes]
}
