import type { ReactNode } from "react"

import type en from "@/messages/en.json"

// English is the source language: its file defines every key, and other
// languages may leave any of them out (they fall back to English).
export type Messages = typeof en
export type PartialMessages = {
	[K in keyof Messages]?: DeepPartial<Messages[K]>
}
type DeepPartial<T> = T extends string ? string : { [K in keyof T]?: DeepPartial<T[K]> }

type PluralCategory = "zero" | "one" | "two" | "few" | "many" | "other"

// "notFound.title" style paths to every string in the messages file.
type Paths<T, Prefix extends string = ""> = {
	[K in keyof T & string]: T[K] extends string
		? `${Prefix}${K}`
		: Paths<T[K], `${Prefix}${K}.`>
}[keyof T & string]

type MessagePath = Paths<Messages>

// Plural forms are stored as "pulls_one" / "pulls_other" and looked up as
// "pulls" with a count, so the suffixed keys aren't valid on their own.
export type MessageKey =
	| Exclude<MessagePath, `${string}_${PluralCategory}`>
	| (MessagePath extends infer P
			? P extends `${infer Base}_other`
				? Base
				: never
			: never)

export type MessageParams = Record<string, string | number>

// For t.rich(): `{name}` placeholders take strings or numbers, `<tag>...</tag>`
// spans take a function that wraps the text inside them.
export type RichParams = Record<
	string,
	string | number | ((chunk: string) => ReactNode)
>

export type Translate = {
	(key: MessageKey, params?: MessageParams): string
	/** For text with markup inside: "Read the <link>privacy policy</link>". */
	rich(key: MessageKey, params: RichParams): ReactNode
}
