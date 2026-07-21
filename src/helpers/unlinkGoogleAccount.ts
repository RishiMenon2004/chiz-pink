import { signOut } from "next-auth/react"

import { deleteBackupFromDrive } from "./googleDrive"

export async function unlinkGoogleAccount(accessToken?: string) {
	if (accessToken) {
		try {
			await deleteBackupFromDrive(accessToken)
		} catch (error) {
			// Don't let a failed delete trap the user into staying linked.
			console.error("Failed to delete Drive backup before unlinking", error)
		}
	}

	await fetch("/api/auth/unlink", { method: "POST" })
	await signOut()
}
