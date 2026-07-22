import { ReactNode } from "react"

import NextLink from "next/link"

export function DescriptionLink({
	url,
	children,
}: {
	url: string
	children: ReactNode
}) {
	return (
		<NextLink className="btn-anchor" href={url}>
			{children}
		</NextLink>
	)
}
