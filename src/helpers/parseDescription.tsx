import { ReactNode } from "react"

import { DescriptionValueType } from "@/types"
import { DescriptionValuesRecord } from "@/types/item"

import {
	DescriptionNumber,
	DescriptionSmallHeading,
} from "@/components/layout/Description"

export function parseDescription(
	description: string,
	tier: number,
	values?: DescriptionValuesRecord
) {
	const regex = /(<[a-z]+>[^<]+<\/>)/g

	const parts = description.split(regex)

	return parts.map((chunk, index) => {
		if (chunk.startsWith("<") && chunk.endsWith("/>")) {
			const tagName = chunk.match(/<([a-z]+)>/)?.[1] ?? "dn"
			const innerContent = chunk.replace(/<[a-z]+>/, "").replace("</>", "")

			const Wrapper = ({ children }: { children: ReactNode }) => {
				switch (tagName) {
					case "dn":
						return <DescriptionNumber>{children}</DescriptionNumber>
					case "sh":
						return (
							<DescriptionSmallHeading>
								{children}
							</DescriptionSmallHeading>
						)
					case "kw":
					default:
						return <>{children}</>
				}
			}

			let displayValue: string | number = ""

			if (innerContent.startsWith("{") && innerContent.endsWith("}")) {
				const attributes: DescriptionValueType[] = values
					? values[tier]
					: [{ type: "Percent", value: 0 }]
				const attrIndex = parseInt(innerContent.slice(1, -1), 10)
				const { type, value } = attributes[attrIndex] ?? {
					type: "Integer",
					value: NaN,
				}
				displayValue =
					type === "Percent" ? `${(value * 100).toFixed(2)}%` : value
			} else {
				displayValue = innerContent
			}

			return <Wrapper key={index}>{displayValue}</Wrapper>
		}

		return (
			<span key={index}>
				{chunk.split("\n").map((line, lineIndex) => (
					<span key={lineIndex}>
						{lineIndex > 0 && <br />}
						{line}
					</span>
				))}
			</span>
		)
	})
}
