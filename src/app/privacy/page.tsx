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
				<p style={{ fontSize: "1.25rem" }}>
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

			<div className={styles.section}>
				<span className={styles.sectionTitle}>
					{"What's Stored On Your Device"}
				</span>
				<p>
					{
						"Your planner progress, inventory counts, and settings are saved in your browser's local storage, along with a timestamp of your last change. None of this leaves your device unless you sign in with Google."
					}
				</p>
			</div>

			<div className={styles.section}>
				<span className={styles.sectionTitle}>
					{"Signing in With Google"}
				</span>
				<p>
					{
						"Signing in is entirely optional and only used for cloud sync. When you sign in, Chiz.Pink asks for:"
					}
				</p>
				<ul>
					<li>
						{
							"Your basic profile and email, so we can show you're signed in and which account is linked."
						}
					</li>
					<li>
						{
							"Access to a single hidden, per-app storage area of your Google Drive (called "
						}
						<code>appDataFolder</code>
						{"). This is"}
						<b> not</b>
						{
							" your regular Drive - Chiz.Pink cannot see, list, or touch any of your actual Drive files, only its own private folder."
						}
					</li>
				</ul>
				<p>
					{
						"Your email is only ever used to show which account is linked in Settings - it isn't used for marketing, isn't shared, and isn't attached to anything else we store."
					}
				</p>
			</div>

			<div className={styles.section}>
				<span className={styles.sectionTitle}>
					{"Cloud Sync & Encryption"}
				</span>
				<p>When you sign in, cloud sync works like this:</p>
				<ul>
					<li>
						{
							"Your local storage data is  encrypted on your own device (AES-256-GCM for the nerds) before anything is sent anywhere."
						}
					</li>
					<li>
						{
							"Only that encrypted, unreadable data is stored in our database ("
						}
						<Link className="btn-anchor" href="https://www.convex.dev" target="_blank">
							Convex
						</Link>
						{"), so it can sync live across your devices."}
					</li>
					<li>
						{
							"The key used to decrypt it is generated on your device and saved only inside your Google Drive's private"
						}
						<code> appDataFolder</code>
						{
							" - it is never sent to, or stored on, Chiz.Pink's own servers or Convex."
						}
					</li>
				</ul>
				<p>
					{
						"In practice, this means nobody but you - not Chiz.Pink, not Convex - can read your synced data. We can see that a backup exists and when it last changed, not what's in it."
					}
				</p>
			</div>

			<div className={styles.section}>
				<span className={styles.sectionTitle}>{"Your Controls"}</span>
				<ul>
					<li>
						<b>{"Erase Data:"}</b>
						{
							" Wipes the local storage data stored on the current device."
						}
					</li>
					<li>
						<b>{"Sign Out:"}</b>
						{
							" Signs you out on your current device, but keeps your cloud backup intact for next time."
						}
					</li>
					<li>
						<b>{"Unlink & Delete Cloud Data:"}</b>
						{
							" Deletes your encrypted backup from Convex, deletes the encryption key from your Drive, removes Chiz.Pink's access to your Google account, and signs you out everywhere - including any other devices you're still signed into."
						}
					</li>
				</ul>
			</div>

			<div className={styles.section}>
				<span className={styles.sectionTitle}>{"Analytics"}</span>
				<p>
					Chiz.Pink uses{" "}
					<Link className="btn-anchor" href="https://vercel.com/analytics" target="_blank">
						Vercel Web Analytics
					</Link>{" "}
					to see aggregate, anonymized traffic, like which pages get
					visited. It&apos;s cookieless and doesn&apos;t identify you
					personally.
				</p>
			</div>

			<div className={styles.section}>
				<span className={styles.sectionTitle}>
					{"Who Else Is Involved"}
				</span>
				<p>
					Chiz.Pink is hosted and run using a small number of
					third-party services, each handling only what&apos;s described
					above:
				</p>
				<ul>
					<li>
						<b>Google</b> - sign-in, and the private Drive folder
						holding your encryption key.
					</li>
					<li>
						<b>Convex</b> - stores your encrypted backup for
						cross-device sync.
					</li>
					<li>
						<b>Vercel</b> - hosts the app itself and the anonymized
						analytics.
					</li>
				</ul>
				<p>
					We don&apos;t sell your data or share it with anyone for
					advertising.
				</p>
			</div>

			<div className={styles.section}>
				<span className={styles.sectionTitle}>{"Changes & Contact"}</span>
				<p>
					If this policy changes in a way that matters, the &quot;last
					updated&quot; date above will change too. Questions or
					requests about your data can be sent to{" "}
					<Link className="btn-anchor" href="mailto:rishimenonx@gmail.com">
						rishimenonx@gmail.com
					</Link>
					.
				</p>
			</div>
		</main>
	)
}
