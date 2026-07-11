import { DescriptionHighlight } from "@/components/layout"
import { Arc, EnumArcTiers } from "@/types/weapon"

export function parseArcEffectDescription(arc: Arc, tier: EnumArcTiers) {
	const description = arc.effect.description
	const attributes = arc.effect.values[tier]

	const regex = /(<lv>[^<]+<\/>)/g

	const parts = description.split(regex)

	return parts.map((chunk, index) => {
		if (chunk.startsWith("<lv>")) {
			const innerContent = chunk.replace("<lv>", "").replace("</>", "")

			let displayValue: string | number = ""

			if (innerContent.startsWith("{") && innerContent.endsWith("}")) {
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

			return (
				<DescriptionHighlight key={index}>
					{displayValue}
				</DescriptionHighlight>
			)
		}

		return (
			<>
				{chunk.split("\n").map((line, index) => (
					<>
						{index > 0 && <br />}
						{line}
					</>
				))}
			</>
		)
	})
}
