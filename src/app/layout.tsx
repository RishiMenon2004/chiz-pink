import type { Metadata, Viewport } from "next"
import { Barlow_Condensed, Syne } from "next/font/google"

import { RoutesData } from "@/data/routes"

import "./globals.css"

import {
	AuthProvider,
	ConvexClientProvider,
	CurrencyBar,
	Footer,
	Sidebar,
	SplashScreen,
} from "@/components/layout"

import { CloudSyncProvider, ServiceWorkerRegister } from "@/helpers"

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

const SITE_URL =
	process.env.NEXT_PUBLIC_SITE_URL ||
	(process.env.VERCEL_PROJECT_PRODUCTION_URL
		? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
		: process.env.VERCEL_URL
			? `https://${process.env.VERCEL_URL}`
			: "https://chiz.pink")

export const metadata: Metadata = {
	metadataBase: new URL(SITE_URL),
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
	openGraph: {
		type: "website",
		locale: "en_US",
		url: SITE_URL,
		siteName: "Chiz.Pink",
		title: "Chiz.Pink",
		description: "Your favourite daily planner and inventory tracker :3",
	},
	twitter: {
		card: "summary_large_image",
		title: "Chiz.Pink",
		description: "Your favourite daily planner and inventory tracker :3",
	},
}

export const viewport: Viewport = {
	themeColor: "#ff569f",
	initialScale: 1,
	width: "device-width",
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
			className={`${barlowCondensed.variable} ${syne.variable}`}
		>
			<body>
				<AuthProvider>
					<SettingsProvider>
						<ConvexClientProvider>
							<CloudSyncProvider>
								<ServiceWorkerRegister />
								<SplashScreen />
								<Sidebar />
								<CurrencyBar />
								{children}
							</CloudSyncProvider>
						</ConvexClientProvider>
					</SettingsProvider>
				</AuthProvider>
				<Footer />
				<Analytics />
			</body>
		</html>
	)
}
