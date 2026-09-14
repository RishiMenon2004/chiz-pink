import { Metadata } from "next"
import Link from "next/link"

import { RoutesData } from "@/data/routes"

import styles from "./privacy.module.css"

export const metadata: Metadata = {
	title: RoutesData["/privacy"].head,
}

export default function PrivacyPolicy() {
	return (
		<main className={`page ${styles.page}`} role="main">
			<div className={styles.intro}>
				<span className={styles.lastUpdated}>
					Last updated: 23 July 2026
				</span>
				<p className={styles.lead}>
					<b>Chiz.Pink</b>
					{
						" is an independent, fan-made companion app and isn't affiliated with or endorsed by the game's publisher. This page explains, in plain language, what data the app handles and where it goes."
					}
				</p>
				<p>
					<b>The short version:</b>
					{
						" everything you do in Chiz.Pink stays on your device by default. If you choose to sign in with Google to sync across devices, your data is encrypted before it ever leaves your device, using a key that's stored only in your own Google Drive. Chiz.Pink and the database that backs it up (Convex) never see your data in a readable form - only you can decrypt it."
					}
				</p>
			</div>

			<div className={`metallic-panel ${styles.section}`}>
				<span className={styles.sectionTitle}>
					{"What's Stored On Your Device"}
				</span>
				<div className={`inset-control ${styles.sectionContent}`}>
					<p>
						{
							"Your planner progress, inventory counts, and settings are saved in your browser's local storage, along with a timestamp of your last change. None of this leaves your device unless you sign in with Google."
						}
					</p>
				</div>
			</div>

			<div className={`metallic-panel ${styles.section}`}>
				<span className={styles.sectionTitle}>
					{"Signing in With Google"}
				</span>
				<div className={`inset-control ${styles.sectionContent}`}>
					<p>
						{
							"Signing in is completely optional. If you do, Chiz.Pink uses Google Sign-In solely to:"
						}
					</p>
					<ul>
						<li>
							<b>Identify your account:</b>
							{
								" your Google account ID links your encrypted backup to you. We store your account email alongside your backup solely so you can see which account you're signed into; we never send marketing emails, track you across sites, or share your email with third parties."
							}
						</li>
						<li>
							<b>Store an encryption key in your Google Drive:</b>
							{
								" during your first sync, Chiz.Pink generates a random AES-256 encryption key and saves it into your Google Drive's "
							}
							<code>appDataFolder</code>
							{
								". This is a hidden, application-specific storage space that only Chiz.Pink can access - Chiz.Pink cannot read, modify, or see any of your personal files, Google Docs, photos, or anything else in your Drive."
							}
						</li>
					</ul>
					<p>
						{
							"The appDataFolder scope is the narrowest access Google offers for app storage. We ask for nothing more."
						}
					</p>
				</div>
			</div>

			<div className={`metallic-panel ${styles.section}`}>
				<span className={styles.sectionTitle}>
					{"How Cloud Backups Work"}
				</span>
				<div className={`inset-control ${styles.sectionContent}`}>
					<p>
						{
							"When cloud sync is active, your planner, inventory, and settings are backed up using end-to-end encryption:"
						}
					</p>
					<ul>
						<li>
							{
								"Before any data leaves your device, it is encrypted locally with your key using AES-GCM (256-bit)."
							}
						</li>
						<li>
							{
								"The encrypted data is stored in a cloud database hosted by "
							}
							<Link
								className="btn-anchor"
								href="https://www.convex.dev"
								target="_blank"
								rel="noopener noreferrer">
								Convex
							</Link>
							{
								". Convex only ever receives ciphertext. Neither Convex nor Chiz.Pink has your key, so neither can read your data."
							}
						</li>
						<li>
							{
								"When you open Chiz.Pink on another device and sign in with the same Google account, the app retrieves the key from your Google Drive, downloads the encrypted backup from Convex, and decrypts it locally."
							}
						</li>
					</ul>
				</div>
			</div>

			<div className={`metallic-panel ${styles.section}`}>
				<span className={styles.sectionTitle}>
					{"Third-Party Services"}
				</span>
				<div className={`inset-control ${styles.sectionContent}`}>
					<p>
						{
							"Chiz.Pink relies on the following third-party infrastructure:"
						}
					</p>
					<ul>
						<li>
							<b>Google Identity & Google Drive API:</b>
							{
								" handles authentication and stores your encryption key in your private appDataFolder. Governed by "
							}
							<Link
								className="btn-anchor"
								href="https://policies.google.com/privacy"
								target="_blank"
								rel="noopener noreferrer">
								{"Google's Privacy Policy"}
							</Link>
							{"."}
						</li>
						<li>
							<b>Convex:</b>
							{
								" stores the encrypted backup blobs and sync metadata. Governed by "
							}
							<Link
								className="btn-anchor"
								href="https://www.convex.dev/privacy"
								target="_blank"
								rel="noopener noreferrer">
								{"Convex's Privacy Policy"}
							</Link>
							{"."}
						</li>
						<li>
							<b>Vercel:</b>
							{
								" hosts the application and serves static assets. Standard web server access logs (IP addresses, request paths) may be collected by Vercel for operational and security purposes, governed by "
							}
							<Link
								className="btn-anchor"
								href="https://vercel.com/legal/privacy-policy"
								target="_blank"
								rel="noopener noreferrer">
								{"Vercel's Privacy Policy"}
							</Link>
							{"."}
						</li>
					</ul>
					<p>
						{
							"There are no advertising trackers, analytics SDKs, or behavioral monitoring scripts on Chiz.Pink."
						}
					</p>
				</div>
			</div>

			<div className={`metallic-panel ${styles.section}`}>
				<span className={styles.sectionTitle}>
					{"Deleting Your Data"}
				</span>
				<div className={`inset-control ${styles.sectionContent}`}>
					<p>
						{
							"You have full control over your data at any time:"
						}
					</p>
					<ul>
						<li>
							<b>Local data:</b>
							{
								' click "Erase Data" in Settings to wipe all locally stored planner progress, inventory counts, and preferences from your browser.'
							}
						</li>
						<li>
							<b>Cloud data:</b>
							{
								' click "Unlink & Delete Cloud Data" in Settings while signed in. This deletes your encrypted backup and account record from Convex immediately and clears your session.'
							}
						</li>
						<li>
							<b>Google Drive app data:</b>
							{
								" you can delete Chiz.Pink's hidden configuration and encryption key directly from your Google account at any time by visiting "
							}
							<Link
								className="btn-anchor"
								href="https://myaccount.google.com/connections"
								target="_blank"
								rel="noopener noreferrer">
								Google Account Connections
							</Link>
							{
								', selecting Chiz.Pink, and clicking "Delete all data that you shared with Chiz.Pink".'
							}
						</li>
					</ul>
				</div>
			</div>

			<div className={`metallic-panel ${styles.section}`}>
				<span className={styles.sectionTitle}>
					{"Changes to This Policy"}
				</span>
				<div className={`inset-control ${styles.sectionContent}`}>
					<p>
						{
							"If any practices described on this page change, the \"Last updated\" date at the top will be updated. Continued use of Chiz.Pink after changes are posted constitutes acceptance of the updated policy."
						}
					</p>
				</div>
			</div>
		</main>
	)
}
