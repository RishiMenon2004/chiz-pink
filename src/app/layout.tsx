import type { Metadata, Viewport } from "next"
import { Barlow_Condensed, Syne } from "next/font/google"
import "@/app/globals.css"
import styles from "@/app/page.module.css"
import NavButton from "@/components/layout/NavButton"
import CurrencyBar from "@/components/layout/CurrencyBar"
import routes from "@/database/routes"

const barlowCondensed = Barlow_Condensed({
	variable: "--font-barlow-condensed",
	weight: ["500", "600"],
	subsets: ["latin"],
})

const syne = Syne({
	variable: "--font-syne",
	weight: "variable",
	subsets: ["latin"],
})

export const metadata: Metadata = {
	title: {
		template: "%s | Chiz.Pink",
		default: routes["/"].head,
	},
	description: "Your favourite daily planner and inventory tracker :3",
	icons: {
		icon: "/favicon.png",
	},
}

export const viewport: Viewport = {
	themeColor: "#ff569f",
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html
			lang="en"
			className={`${barlowCondensed.variable} ${syne.variable}`}
		>
			<body className={styles.page}>
				<Sidebar />
				<CurrencyBar />
				{children}
			</body>
		</html>
	)
}

function Sidebar() {
	return (
		<div className="sidebar">
			<nav>
				<NavButton href="" icon="home" />
				<NavButton href="checklist" icon="checklist" />
				<NavButton href="characters" icon="characters" />
				<NavButton href="arcs" icon="arcs" />
				<NavButton href="inventory" icon="inventory" />
				<NavButton href="settings" icon="settings" className="inside" />
			</nav>

			<svg xmlns="http://www.w3.org/2000/svg" className="fender">
				<path d="M68.1396 0C71.3754 0 74.293 1.94905 75.5312 4.93848L88.7852 36.9385C90.9669 42.2059 87.0959 47.9999 81.3945 48H0V0H68.1396Z" />
			</svg>

			<NavButton href="settings" icon="settings" className="outside" />
		</div>
	)
}
