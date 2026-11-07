import { NteExporterData } from "@/types/pulls"

type EncryptedDrop = { ciphertext: string; iv: string }

function fromBase64(value: string) {
	return Uint8Array.from(atob(value), (char) => char.charCodeAt(0))
}

function fromBase64Url(value: string) {
	const base64 = value.replace(/-/g, "+").replace(/_/g, "/")
	return fromBase64(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="))
}

export function parseDropFragment(hash: string) {
	const [dropId, key, ...rest] = hash.replace(/^#/, "").split(".")
	return dropId && key && rest.length === 0 ? { dropId, key } : null
}

export async function decryptDrop(drop: EncryptedDrop, key: string) {
	const cryptoKey = await crypto.subtle.importKey(
		"raw",
		fromBase64Url(key),
		"AES-GCM",
		false,
		["decrypt"]
	)
	const compressed = await crypto.subtle.decrypt(
		{ name: "AES-GCM", iv: fromBase64(drop.iv) },
		cryptoKey,
		fromBase64(drop.ciphertext)
	)
	const stream = new Blob([compressed])
		.stream()
		.pipeThrough(new DecompressionStream("gzip"))
	const payload: { version: number; exports: NteExporterData[] } =
		await new Response(stream).json()

	if (payload.version !== 1 || !Array.isArray(payload.exports)) {
		throw new Error("Unrecognised import format")
	}
	return payload.exports
}
