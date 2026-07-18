import type { Metadata, Viewport } from "next"
import { Barlow_Condensed, Syne } from "next/font/google"

import { RoutesData } from "@/data/routes"

import { CurrencyBar, Footer, Sidebar, SplashScreen } from "@/components/layout"
import { ServiceWorkerRegister } from "@/helpers"

import "./globals.css"

const barlowCondensed = Barlow_Condensed({
	variable: "--font-barlow-condensed",
	weight: ["500", "600", "700"],
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
		apple: "/app_icon.png",
	},
	appleWebApp: {
		capable: true,
		title: "Chiz.Pink",
		statusBarStyle: "black-translucent",
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
			<body>
				<ServiceWorkerRegister />
				<SplashScreen />
				<Sidebar />
				<CurrencyBar />
				{children}
				<Footer />
			</body>
		</html>
	)
}
