import Link from "next/link"

import styles from "./footer.module.css"

export function Footer() {
	return (
		<footer className={styles.footer} role="contentinfo">
			<span className={styles.left}>
				<div>
					&copy; <b className={styles.pink}>Rishi Menon</b> 2026
				</div>
				<div className={styles.small}>
					<Link
						target="_blank"
						rel="noopener noreferrer"
						href="https://github.com/RishiMenon2004/chiz-pink/"
						className="btn-anchor">
						<b>GITHUB</b>
					</Link>
					{" | Found a "}
					<Link
						target="_blank"
						rel="noopener noreferrer"
						href="https://github.com/RishiMenon2004/chiz-pink/issues"
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
					<b className={styles.pink}>CHIZ.PINK</b> is an unoffical
					project and is not affilitated with{" "}
					<b className={styles.pink}>HOTTA STUDIO&trade;</b>
				</div>
			</span>
		</footer>
	)
}
