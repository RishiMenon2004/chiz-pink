import { ReactNode } from "react"

import { LocaleLink } from "../../LocaleLink"

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
		<LocaleLink className="btn-anchor" href={url} onClick={onClick}>
			{children}
		</LocaleLink>
	)
}
