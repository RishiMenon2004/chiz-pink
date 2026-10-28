import type { Metadata, Viewport } from "next"
import { Barlow_Condensed, Syne } from "next/font/google"

import { RoutesData } from "@/data/routes"

import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/helpers/metadata"

import "./globals.css"

import { AuthProvider } from "@/components/layout/AuthProvider"
import { ConvexClientProvider } from "@/components/layout/ConvexClientProvider"
import { CurrencyBar } from "@/components/layout/CurrencyBar/CurrencyBar"
import { DomainMoveGate } from "@/components/layout/DomainMoveGate"
import { Footer } from "@/components/layout/Footer"
import { Sidebar } from "@/components/layout/Sidebar"
import { SplashScreen } from "@/components/layout/SplashScreen"

import { ServiceWorkerRegister } from "@/helpers/ServiceWorkerRegister"
import { SyncErrorBoundary } from "@/helpers/SyncErrorBoundary"
import { AppStorageInitializer } from "@/helpers/AppStorageInitializer"

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
	metadataBase: new URL(SITE_URL),
	title: {
		template: `%s | ${SITE_NAME}`,
		default: RoutesData["/"].head,
	},
	description: SITE_DESCRIPTION,
	icons: {
		icon: "/favicon.png",
		apple: "/app_icon.png",
	},
	appleWebApp: {
		capable: true,
		title: SITE_NAME,
		statusBarStyle: "default",
	},
	// Fallback for pages without their own (404s, offline). Pages build
	// their own with buildMetadata(), since a page's openGraph replaces this
	// one entirely. No url here: it would mark every page as the home page.
	openGraph: {
		type: "website",
		locale: "en_US",
		siteName: SITE_NAME,
		title: SITE_NAME,
		description: SITE_DESCRIPTION,
	},
	twitter: {
		card: "summary_large_image",
		title: SITE_NAME,
		description: SITE_DESCRIPTION,
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
				<AppStorageInitializer />
				<AuthProvider>
					<SettingsProvider>
						<ConvexClientProvider>
							<SyncErrorBoundary>
								<ServiceWorkerRegister />
								<SplashScreen />
								<DomainMoveGate />
								<Sidebar />
								<CurrencyBar />
								{children}
							</SyncErrorBoundary>
						</ConvexClientProvider>
					</SettingsProvider>
				</AuthProvider>
				<Footer />
				<Analytics />
			</body>
		</html>
	)
}
