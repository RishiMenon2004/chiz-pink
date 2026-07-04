import { RoutesData } from "@/data/routes"
import { Metadata } from "next"

export const metadata: Metadata = {
	title: RoutesData["/settings"].head,
}

export default function Settings() {}
