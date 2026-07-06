import { Metadata } from "next"

import { RoutesData } from "@/data/routes"

export const metadata: Metadata = {
	title: RoutesData["/settings"].head,
}

export default function Settings() {}
