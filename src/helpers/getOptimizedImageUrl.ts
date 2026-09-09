export function getOptimizedImageUrl(src: string, width = 640, quality = 75) {
	return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`
}
