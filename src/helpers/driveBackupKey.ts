const KEY_FILE_NAME = "chiz-pink-key.json"
const DRIVE_FILES_URL = "https://www.googleapis.com/drive/v3/files"
const DRIVE_UPLOAD_URL = "https://www.googleapis.com/upload/drive/v3/files"
const MULTIPART_BOUNDARY = "chiz_pink_key_boundary"

type KeyFileContents = { k: string; alg: "AES-GCM-256"; v: 1 }

async function findKeyFileId(accessToken: string) {
	const params = new URLSearchParams({
		q: `name='${KEY_FILE_NAME}' and trashed=false`,
		spaces: "appDataFolder",
		fields: "files(id)",
	})

	const response = await fetch(`${DRIVE_FILES_URL}?${params}`, {
		headers: { Authorization: `Bearer ${accessToken}` },
	})

	if (!response.ok) {
		throw new Error(`Failed to search Drive for key file: ${response.status}`)
	}

	const { files } = (await response.json()) as { files: { id: string }[] }
	return files[0]?.id ?? null
}

async function uploadKeyToDrive(accessToken: string, contents: KeyFileContents) {
	const body = JSON.stringify(contents)
	const metadata = {
		name: KEY_FILE_NAME,
		mimeType: "application/json",
		parents: ["appDataFolder"],
	}
	const multipartBody =
		`--${MULTIPART_BOUNDARY}\r\n` +
		`Content-Type: application/json; charset=UTF-8\r\n\r\n` +
		`${JSON.stringify(metadata)}\r\n` +
		`--${MULTIPART_BOUNDARY}\r\n` +
		`Content-Type: application/json\r\n\r\n` +
		`${body}\r\n` +
		`--${MULTIPART_BOUNDARY}--`

	const response = await fetch(`${DRIVE_UPLOAD_URL}?uploadType=multipart`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"Content-Type": `multipart/related; boundary=${MULTIPART_BOUNDARY}`,
		},
		body: multipartBody,
	})

	if (!response.ok) {
		throw new Error(`Failed to create Drive key file: ${response.status}`)
	}
}

async function downloadKeyFromDrive(accessToken: string) {
	const fileId = await findKeyFileId(accessToken)
	if (!fileId) return null

	const response = await fetch(`${DRIVE_FILES_URL}/${fileId}?alt=media`, {
		headers: { Authorization: `Bearer ${accessToken}` },
	})

	if (!response.ok) {
		throw new Error(`Failed to download Drive key file: ${response.status}`)
	}

	return (await response.json()) as KeyFileContents
}

/**
 * Returns this account's AES-256-GCM backup key, generating and uploading a
 * new one to Drive's appDataFolder if none exists yet. Called directly from
 * the browser against googleapis.com - the raw key never passes through our
 * own server, only through Drive and the user's own devices.
 */
export async function getOrCreateBackupKey(accessToken: string): Promise<CryptoKey> {
	const existing = await downloadKeyFromDrive(accessToken)

	if (existing) {
		const raw = Uint8Array.from(window.atob(existing.k), (c) => c.charCodeAt(0))
		return crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, [
			"encrypt",
			"decrypt",
		])
	}

	const key = await crypto.subtle.generateKey(
		{ name: "AES-GCM", length: 256 },
		true,
		["encrypt", "decrypt"]
	)

	const raw = new Uint8Array(await crypto.subtle.exportKey("raw", key))
	let binary = ""
	for (const byte of raw) binary += String.fromCharCode(byte)
	const encoded = window.btoa(binary)

	await uploadKeyToDrive(accessToken, { k: encoded, alg: "AES-GCM-256", v: 1 })

	return key
}

export async function deleteBackupKeyFromDrive(accessToken: string) {
	const fileId = await findKeyFileId(accessToken)
	if (!fileId) return

	const response = await fetch(`${DRIVE_FILES_URL}/${fileId}`, {
		method: "DELETE",
		headers: { Authorization: `Bearer ${accessToken}` },
	})

	if (!response.ok && response.status !== 404) {
		throw new Error(`Failed to delete Drive key file: ${response.status}`)
	}
}
