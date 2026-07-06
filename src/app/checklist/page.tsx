import { Metadata } from "next"

import { RoutesData } from "@/data/routes"

export const metadata: Metadata = {
	title: RoutesData["/checklist"].head,
}

export default function Checklist() {}
