import type { Metadata, Viewport } from "next"
import { Barlow_Condensed, Syne } from "next/font/google"

import { RoutesData } from "@/data/routes"

import { CurrencyBar } from "@/components/layout/CurrencyBar"
import { Sidebar } from "@/components/layout/Sidebar"
import { SplashScreen } from "@/components/layout/SplashScreen"

import "./globals.css"
import styles from "./page.module.css"

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
		default: RoutesData["/"].head,
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
			className={`${barlowCondensed.variable} ${syne.variable}`}>
			<body className={styles.page}>
				<SplashScreen />
				<Sidebar />
				<CurrencyBar />
				{children}
			</body>
		</html>
	)
}
