import type { buildBackupPayload } from "./backupData"

const BACKUP_FILE_NAME = "chiz-pink-backup.json"
const DRIVE_FILES_URL = "https://www.googleapis.com/drive/v3/files"
const DRIVE_UPLOAD_URL = "https://www.googleapis.com/upload/drive/v3/files"
const MULTIPART_BOUNDARY = "chiz_pink_backup_boundary"

async function findBackupFileId(accessToken: string) {
	const params = new URLSearchParams({
		q: `name='${BACKUP_FILE_NAME}' and trashed=false`,
		spaces: "appDataFolder",
		fields: "files(id)",
	})

	const response = await fetch(`${DRIVE_FILES_URL}?${params}`, {
		headers: { Authorization: `Bearer ${accessToken}` },
	})

	if (!response.ok) {
		throw new Error(`Failed to search Drive for backup file: ${response.status}`)
	}

	const { files } = (await response.json()) as { files: { id: string }[] }
	return files[0]?.id ?? null
}

export async function uploadBackupToDrive(
	accessToken: string,
	payload: ReturnType<typeof buildBackupPayload>
) {
	const fileId = await findBackupFileId(accessToken)
	const body = JSON.stringify(payload)

	if (fileId) {
		const response = await fetch(
			`${DRIVE_UPLOAD_URL}/${fileId}?uploadType=media`,
			{
				method: "PATCH",
				headers: {
					Authorization: `Bearer ${accessToken}`,
					"Content-Type": "application/json",
				},
				body,
			}
		)

		if (!response.ok) {
			throw new Error(`Failed to update Drive backup: ${response.status}`)
		}

		return fileId
	}

	const metadata = {
		name: BACKUP_FILE_NAME,
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
		throw new Error(`Failed to create Drive backup: ${response.status}`)
	}

	const created = (await response.json()) as { id: string }
	return created.id
}

/** Returns the backup file's raw JSON contents, or `null` if no backup exists on Drive yet. */
export async function downloadBackupFromDrive(accessToken: string) {
	const fileId = await findBackupFileId(accessToken)
	if (!fileId) return null

	const response = await fetch(`${DRIVE_FILES_URL}/${fileId}?alt=media`, {
		headers: { Authorization: `Bearer ${accessToken}` },
	})

	if (!response.ok) {
		throw new Error(`Failed to download Drive backup: ${response.status}`)
	}

	return response.text()
}

export async function deleteBackupFromDrive(accessToken: string) {
	const fileId = await findBackupFileId(accessToken)
	if (!fileId) return

	const response = await fetch(`${DRIVE_FILES_URL}/${fileId}`, {
		method: "DELETE",
		headers: { Authorization: `Bearer ${accessToken}` },
	})

	if (!response.ok && response.status !== 404) {
		throw new Error(`Failed to delete Drive backup: ${response.status}`)
	}
}
