import type { ReactNode } from "react"

import type en from "@/messages/en.json"
import type enArcs from "@/messages/game/arcs/en.json"
import type enMaterials from "@/messages/game/materials/en.json"

import type { Locale } from "@/helpers/locale"

// English is the source language: its files define every key, and other
// languages may leave any of them out (they fall back to English).
export type ArcMessages = typeof enArcs
export type MaterialMessages = typeof enMaterials
export type Messages = typeof en & {
	arcs: ArcMessages
	materials: MaterialMessages
}
export type PartialMessages = {
	[K in keyof Messages]?: DeepPartial<Messages[K]>
}
type DeepPartial<T> = T extends string ? string : { [K in keyof T]?: DeepPartial<T[K]> }

type PluralCategory = "zero" | "one" | "two" | "few" | "many" | "other"
type GenderForm = "male" | "female"

// "notFound.title" style paths to every string in the messages file.
type Paths<T, Prefix extends string = ""> = {
	[K in keyof T & string]: T[K] extends string
		? `${Prefix}${K}`
		: Paths<T[K], `${Prefix}${K}.`>
}[keyof T & string]

type MessagePath = Paths<Messages>

// Plural forms are stored as "pulls_one" / "pulls_other" and looked up as
// "pulls" with a count, so the suffixed keys aren't valid on their own. The
// same goes for gendered forms ("view_male"), picked with a gender param.
export type MessageKey =
	| Exclude<MessagePath, `${string}_${PluralCategory}` | `${string}_${GenderForm}`>
	| (MessagePath extends infer P
			? P extends `${infer Base}_other`
				? Base
				: never
			: never)

// null / undefined are allowed so optional values (a character's gender) can
// be passed straight through; they never fill a placeholder.
export type MessageParams = Record<string, string | number | null | undefined>

// For t.rich(): `{name}` placeholders take strings or numbers, `<tag>...</tag>`
// spans take a function that wraps the text inside them.
export type RichParams = Record<
	string,
	string | number | null | undefined | ((chunk: string) => ReactNode)
>

export type Translate = {
	(key: MessageKey, params?: MessageParams): string
	/** For text with markup inside: "Read the <link>privacy policy</link>". */
	rich(key: MessageKey, params: RichParams): ReactNode
	/** The language this translator was made for. */
	locale: Locale
}
