import { Fragment, ReactNode } from "react"

import { DescriptionValueType } from "@/types"
import { DescriptionValuesRecord } from "@/types/item"

import {
	DescriptionLink,
	DescriptionNumber,
	DescriptionSmallHeading,
} from "@/components/layout/Description"

const ATTRIBUTE_REGEX = /([a-z]+)=(?:"([^"]*)"|'([^']*)')/g
const OPEN_TAG_REGEX = /^<([a-z]+)((?:\s+[a-z]+=(?:"[^"]*"|'[^']*'))*)>/

export function parseDescription(
	description: string,
	tier: number = 1,
	values?: DescriptionValuesRecord,
	onLinkClick?: () => void
) {
	const regex = /(<[a-z]+(?:\s+[a-z]+=(?:"[^"]*"|'[^']*'))*>[^<]+<\/>)/g

	const parts = description.split(regex)

	return parts.map((chunk, index) => {
		if (chunk === "") {
			return
		}

		if (chunk === " ") {
			return " "
		}

		if (chunk.startsWith("<") && chunk.endsWith("/>")) {
			const openTagMatch = chunk.match(OPEN_TAG_REGEX)
			const tagName = openTagMatch?.[1] ?? "dn"

			const tagAttributes: Record<string, string> = {}
			for (const match of (openTagMatch?.[2] ?? "").matchAll(
				ATTRIBUTE_REGEX
			)) {
				tagAttributes[match[1]] = match[2] ?? match[3]
			}

			const innerContent = chunk
				.replace(OPEN_TAG_REGEX, "")
				.replace("</>", "")

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
					case "link":
						return (
							<DescriptionLink
								url={tagAttributes.href ?? "#"}
								onClick={onLinkClick}>
								{children}
							</DescriptionLink>
						)
					case "tag":
						return (
							<span
								data-taller-line={true}
								style={{
									fontSize: "0.75em",
									fontWeight: 750,
									backgroundColor: `${tagAttributes.color ?? "var(--pink)"}`,
									padding: "0.25em 0.75em",
									borderRadius: "100vh",
									marginInlineEnd: "0.25rem",
									paintOrder: "stroke fill",
									WebkitTextStroke: "3px black",
								}}>
								{children}
							</span>
						)
					case "ntetag":
						return (
							<span
								data-taller-line={true}
								style={{
									fontSize: "0.75em",
									fontWeight: 750,
									backgroundColor: "#50f1ff",
									padding: "0.25em 0.75em",
									borderRadius: "100vh",
									marginInlineEnd: "0.25rem",
									paintOrder: "stroke fill",
									WebkitTextStroke: "3px black",
								}}>
								{children}
							</span>
						)
					case "itag":
						return (
							<span
								data-taller-line={true}
								style={{
									fontSize: "0.9em",
									backgroundColor: `${tagAttributes.color ?? "var(--pink)"}`,
									padding: "0 0.5em",
									borderRadius: "100vh",
									marginInline: "0.25rem",
									whiteSpace: "nowrap",
									paintOrder: "stroke fill",
									WebkitTextStroke: "2px black",
								}}>
								{children}
							</span>
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

		return chunk.split("\n").map((line, lineIndex) => (
			<Fragment key={lineIndex}>
				{lineIndex > 0 && <br />}
				<span>{line}</span>
			</Fragment>
		))
	})
}
