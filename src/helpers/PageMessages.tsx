import type { ReactNode } from "react"

import { toLocale } from "@/helpers/locale"
import { getPageMessages, type MessageNamespace } from "@/helpers/messages"

import { LocaleMessagesProvider } from "@/contexts"

// Serializes only the requested message namespaces for a route's client tree.
export async function PageMessages({
	lang,
	namespaces,
	children,
}: {
	lang: string
	namespaces: readonly MessageNamespace[]
	children: ReactNode
}) {
	const messages = await getPageMessages(toLocale(lang), namespaces)

	return (
		<LocaleMessagesProvider messages={messages}>
			{children}
		</LocaleMessagesProvider>
	)
}
