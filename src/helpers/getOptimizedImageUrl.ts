export function getOptimizedImageUrl(src: string, width = 640, quality = 75) {
	if (process.env.NODE_ENV === "development") return src
	return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`
}
