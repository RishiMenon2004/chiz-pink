import { ReactNode } from "react"

export function DescriptionNumber({ children }: { children: ReactNode }) {
	return (
		<span
			style={{
				color: "var(--pink)",
				fontFamily: "var(--font-barlow-condensed)",
				fontWeight: 700,
				letterSpacing: "5%",
				marginLeft: "0.25ch",
			}}>
			{children}
		</span>
	)
}
