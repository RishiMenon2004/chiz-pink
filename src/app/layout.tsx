import type { Metadata, Viewport } from "next"
import { Barlow_Condensed, Syne } from "next/font/google"

import { RoutesData } from "@/data/routes"

import {
	AuthProvider,
	ConvexClientProvider,
	CurrencyBar,
	Footer,
	Sidebar,
	SplashScreen,
} from "@/components/layout"
import { CloudSyncProvider, ServiceWorkerRegister } from "@/helpers"

import "./globals.css"
import { Analytics } from "@vercel/analytics/next"
import { SettingsProvider } from "@/hooks/useSettingsStore"

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
		statusBarStyle: "default",
	},
}

export const viewport: Viewport = {
	themeColor: "#ff569f",
	width: "device-width",
	initialScale: 1,
	maximumScale: 2,
	userScalable: true,
	viewportFit: "cover",
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
			<AuthProvider>
				<SettingsProvider>
					<ConvexClientProvider>
						<CloudSyncProvider>
							<ServiceWorkerRegister />
							<SplashScreen />
							<Sidebar />
							<CurrencyBar />
							{children}
							<Footer />
						</CloudSyncProvider>
					</ConvexClientProvider>
				</SettingsProvider>
			</AuthProvider>
			<Analytics />
		</html>
	)
}
