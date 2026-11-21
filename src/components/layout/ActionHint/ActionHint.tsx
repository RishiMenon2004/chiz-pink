import styles from "./actionHint.module.css"

export function ActionHint({
	desktop,
	touch,
	surface = "dark",
	className,
}: {
	desktop?: string
	touch?: string
	surface?: "dark" | "light"
	className?: string
}) {
	if (!desktop && !touch) return null

	const visibility =
		desktop && touch ? undefined : touch ? "touch-only" : "desktop-only"

	return (
		<p
			className={className ? `${styles.hint} ${className}` : styles.hint}
			data-surface={surface}
			data-visibility={visibility}>
			{desktop && touch ? (
				<>
					<span className={styles.desktop}>{desktop}</span>
					<span className={styles.touch}>{touch}</span>
				</>
			) : (
				<span>{desktop ?? touch}</span>
			)}
		</p>
	)
}
