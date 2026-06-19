"use client"

import routes from "@/database/routes"
import { usePathname } from "next/navigation"

export default function PageTitle() {
	const pathname = usePathname()

  const currentRoute = routes[pathname]

  return (
    <h1>{currentRoute.title}</h1>
  )
}