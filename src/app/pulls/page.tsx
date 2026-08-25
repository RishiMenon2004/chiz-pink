import { Metadata } from "next"

import { RoutesData } from "@/data/routes"

export const metadata: Metadata = {
	title: RoutesData["/pulls"].head,
}

export default function Planner() {
	return <main className={`page`} role="main"></main>
}
