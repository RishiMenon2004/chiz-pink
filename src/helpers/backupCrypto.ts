import type { BackupData, MainBackupData, GachaBackupData } from "@/types/settings"

const IV_LENGTH_BYTES = 12

function bytesToBase64(bytes: Uint8Array) {
	let binary = ""
	for (const byte of bytes) binary += String.fromCharCode(byte)
	return window.btoa(binary)
}

function base64ToBytes(base64: string) {
	const binary = window.atob(base64)
	const bytes = new Uint8Array(binary.length)
	for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
	return bytes
}

function bytesToHex(bytes: Uint8Array) {
	return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")
}

async function gzipEncode(text: string): Promise<Uint8Array<ArrayBuffer>> {
	const stream = new Blob([text]).stream().pipeThrough(new CompressionStream("gzip"))
	return new Uint8Array(await new Response(stream).arrayBuffer())
}

async function gzipDecode(bytes: Uint8Array<ArrayBuffer>): Promise<string> {
	const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"))
	return new TextDecoder().decode(await new Response(stream).arrayBuffer())
}

// Rows written before gzip compression was added store plain UTF-8 JSON -
// gunzipping that raw JSON fails on the gzip header check, so fall back to
// decoding it directly instead of treating an old row as corrupt.
async function decodeBackupBytes(bytes: Uint8Array<ArrayBuffer>): Promise<string> {
	try {
		return await gzipDecode(bytes)
	} catch {
		return new TextDecoder().decode(bytes)
	}
}

// SHA-256 fingerprint of a payload's JSON serialization, used to skip
// re-uploading a slice whose content hasn't actually changed since the last
// push even though its lastUpdated timestamp did.
export async function hashBackupPayload<T extends object>(payload: T) {
	const bytes = new TextEncoder().encode(JSON.stringify(payload))
	const digest = await crypto.subtle.digest("SHA-256", bytes)
	return bytesToHex(new Uint8Array(digest))
}

export async function encryptBackupPayload<T extends object>(
	key: CryptoKey,
	payload: T
) {
	const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH_BYTES))
	const plaintext = await gzipEncode(JSON.stringify(payload))

	const encrypted = await crypto.subtle.encrypt(
		{ name: "AES-GCM", iv },
		key,
		plaintext
	)

	return {
		ciphertext: bytesToBase64(new Uint8Array(encrypted)),
		iv: bytesToBase64(iv),
	}
}

export async function decryptBackupPayload<T = BackupData>(
	key: CryptoKey,
	ciphertext: string,
	iv: string
): Promise<T> {
	const decrypted = await crypto.subtle.decrypt(
		{ name: "AES-GCM", iv: base64ToBytes(iv) },
		key,
		base64ToBytes(ciphertext)
	)

	const json = await decodeBackupBytes(new Uint8Array(decrypted))
	return JSON.parse(json) as T
}

export {
	type MainBackupData,
	type GachaBackupData,
	type BackupData,
}
