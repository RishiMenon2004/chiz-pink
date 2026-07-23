import type { BackupData } from "@/types/settings"
import type { buildBackupPayload } from "./backupData"

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

export async function encryptBackupPayload(
	key: CryptoKey,
	payload: ReturnType<typeof buildBackupPayload>
) {
	const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH_BYTES))
	const plaintext = new TextEncoder().encode(JSON.stringify(payload))

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

export async function decryptBackupPayload(
	key: CryptoKey,
	ciphertext: string,
	iv: string
): Promise<BackupData> {
	const decrypted = await crypto.subtle.decrypt(
		{ name: "AES-GCM", iv: base64ToBytes(iv) },
		key,
		base64ToBytes(ciphertext)
	)

	return JSON.parse(new TextDecoder().decode(decrypted)) as BackupData
}
