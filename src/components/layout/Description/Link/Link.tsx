import { ReactNode } from "react"

import NextLink from "next/link"

export function DescriptionLink({
	url,
	children,
	onClick,
}: {
	url: string
	children: ReactNode
	onClick?: () => void
}) {
	return (
		<NextLink className="btn-anchor" href={url} onClick={onClick}>
			{children}
		</NextLink>
	)
}
