import { Metadata } from "next"

import { RoutesData } from "@/data/routes"

import { RenderHome } from "./RenderHome"

export const metadata: Metadata = {
	title: RoutesData["/"].head,
}

export default function Home() {
	return <RenderHome/>
}
