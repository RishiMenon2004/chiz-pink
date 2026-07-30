import { ReactNode } from "react"

export function DescriptionNumber({ children }: { children: ReactNode }) {
	return (
		<span
			style={{
				color: "var(--pink)",
				fontSize: "1.1em",
				fontFamily: "var(--font-barlow-condensed)",
				fontWeight: 700,
				letterSpacing: "5%",
				marginLeft: "0.25ch",
			}}>
			{children}
		</span>
	)
}
