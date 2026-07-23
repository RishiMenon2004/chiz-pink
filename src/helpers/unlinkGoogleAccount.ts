import { signOut } from "next-auth/react"

import { deleteBackupKeyFromDrive } from "./driveBackupKey"

export async function unlinkGoogleAccount(accessToken?: string) {
	if (accessToken) {
		try {
			await deleteBackupKeyFromDrive(accessToken)
		} catch (error) {
			// Don't let a failed delete trap the user into staying linked.
			console.error("Failed to delete Drive key file before unlinking", error)
		}
	}

	await fetch("/api/auth/unlink", { method: "POST" })
	await signOut()
}
