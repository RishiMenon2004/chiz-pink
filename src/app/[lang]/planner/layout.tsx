import type { ReactNode } from "react"

import { PageMessages } from "@/helpers/PageMessages"

import { PlannerLayoutClient } from "./PlannerLayoutClient"

export default async function PlannerLayout({
	children,
	params,
}: {
	children: ReactNode
	params: Promise<{ lang: string }>
}) {
	const { lang } = await params

	return (
		<PageMessages lang={lang} namespaces={["planner"]}>
			<PlannerLayoutClient>{children}</PlannerLayoutClient>
		</PageMessages>
	)
}
