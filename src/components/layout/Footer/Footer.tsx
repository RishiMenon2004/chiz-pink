import Link from "next/link"

import { FooterAbout } from "./FooterAbout"

import styles from "./footer.module.css"

export function Footer() {
	return (
		<footer className={styles.footer} role="contentinfo">
			<span className={styles.left}>
				<div>
					&copy; <b className={styles.pink}>Rishi Menon</b> 2026
				</div>
				<div className={styles.small}>
					<Link href="/privacy" className="btn-anchor">
						<b>PRIVACY POLICY</b>
					</Link>
					{" | Found a "}
					<Link
						target="_blank"
						rel="noopener noreferrer"
						href="https://discord.gg/rSeMKWMy69"
						className="btn-anchor">
						<b>BUG?</b>
					</Link>
					{" | Made with "}
					<Link
						target="_blank"
						rel="noopener noreferrer"
						href="https://nextjs.org/"
						className="btn-anchor">
						<b>NextJS</b>
					</Link>
				</div>
			</span>
			<span className={styles.right}>
				<div>
					Game contents belong to{" "}
					<b className={styles.pink}>HOTTA STUDIO&trade;</b>
				</div>
				<div className={styles.small}>
					<FooterAbout className={styles.about}>
						<summary aria-label="About Chiz.Pink">
							<b className={styles.pink}>CHIZ.PINK</b>
							<sup className={styles.aboutHint}>?</sup>
						</summary>
						<div className={`metallic-panel ${styles.aboutPanel}`}>
							<p className={`inset-control ${styles.aboutText}`}>
								<b className={styles.pink}>Chiz.Pink</b> is a daily
								companion app for Neverness to Everness (NTE). Plan your
								Esper and arc ascensions, track your pulls and pity on
								every banner, check off your dailies and weeklies, and
								keep count of your materials. Everything is saved in
								your browser locally without an account.
							</p>
						</div>
					</FooterAbout>{" "}
					is an unofficial
					project and is not affiliated with{" "}
					<b className={styles.pink}>HOTTA STUDIO&trade;</b>
				</div>
			</span>
		</footer>
	)
}
