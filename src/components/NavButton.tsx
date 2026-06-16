"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function NavButton({ href, icon, className }: { href: string, icon: string, className?: string | undefined }) {
	const pathname = usePathname()
  const active = pathname === `/${href}`

	return (<Link href={`/${href}`} className={`nav-btn ${active && "active"} ${className}`} style={{backgroundImage: `url("/nav/${icon}")`}}>
		<span
			className="icon" style={{backgroundImage: `url("/nav/border/${icon}")`}}
		/>
	</Link>)
}