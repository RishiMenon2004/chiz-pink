import { RoutesData } from "@/data/routes"
import { Metadata } from "next"

export const metadata: Metadata = {
	title: RoutesData["/checklist"].head,
}

export default function Checklist() {}
