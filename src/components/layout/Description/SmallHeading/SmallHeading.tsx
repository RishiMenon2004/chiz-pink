import { ReactNode } from "react"

export function DescriptionSmallHeading({ children }: { children: ReactNode }) {
	return (
		<span
			style={{
				color: "var(--darker-pink)",
				fontFamily: "var(--font-syne)",
				fontWeight: 650,
				letterSpacing: "2.5%",
				marginRight: "0.25ch",
			}}>
			{children}
		</span>
	)
}
