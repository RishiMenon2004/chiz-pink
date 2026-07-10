import styles from "./footer.module.css"

export function Footer() {
	return (
		<footer className={styles.footer}>
			<span className={styles.left}>
				<div>
					&copy; <b className={styles.pink}>Rishi Menon</b> 2026
				</div>
				<div className={styles.small}>
					<a
						href="https://github.com/RishiMenon2004/chiz-pink/"
						className="btn-anchor">
						<b>GITHUB</b>
					</a>
					{" | "}
					Made with <a
						href="https://nextjs.org/"
						className="btn-anchor">
						<b>NextJS</b>
					</a>
					{/* Report a <a href="https://github.com/RishiMenon2004/chiz-pink/issues" className="btn-anchor"><b>BUG</b></a> */}
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
