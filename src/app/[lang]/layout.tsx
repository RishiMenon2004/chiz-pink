import type { Metadata, Viewport } from "next"
import { Barlow_Condensed, Syne } from "next/font/google"
import { notFound } from "next/navigation"

import { isLocale, LOCALES } from "@/helpers/locale"
import { getMessages } from "@/helpers/messages"
import {
	getMetadataTranslator,
	ogLocale,
	SITE_NAME,
	SITE_URL,
	siteOgImage,
} from "@/helpers/metadata"

import "../globals.css"

import { AuthProvider } from "@/components/layout/AuthProvider"
import { ConvexClientProvider } from "@/components/layout/ConvexClientProvider"
import { CurrencyBar } from "@/components/layout/CurrencyBar/CurrencyBar"
import { DomainMoveGate } from "@/components/layout/DomainMoveGate"
import { Footer } from "@/components/layout/Footer"
import { Sidebar } from "@/components/layout/Sidebar"
import { SiteAnalytics } from "@/components/layout/SiteAnalytics"
import { SplashScreen } from "@/components/layout/SplashScreen"

import { ServiceWorkerRegister } from "@/helpers/ServiceWorkerRegister"
import { SyncErrorBoundary } from "@/helpers/SyncErrorBoundary"
import { AppStorageInitializer } from "@/helpers/AppStorageInitializer"

import { SettingsProvider } from "@/hooks/useSettingsStore"

import { LocaleProvider } from "@/contexts"

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

export async function generateMetadata({
	params,
}: {
	params: Promise<{ lang: string }>
}): Promise<Metadata> {
	const t = await getMetadataTranslator((await params).lang)
	const description = t("site.description")
	const image = siteOgImage(t)

	return {
		metadataBase: new URL(SITE_URL),
		title: {
			template: `%s | ${SITE_NAME}`,
			default: t("routes.home.head"),
		},
		description,
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
			locale: ogLocale(t.locale),
			siteName: SITE_NAME,
			title: SITE_NAME,
			description,
			images: [image],
		},
		twitter: {
			card: "summary_large_image",
			title: SITE_NAME,
			description,
			images: [image],
		},
	}
}

export const viewport: Viewport = {
	themeColor: "#ff569f",
	initialScale: 1,
	width: "device-width",
	maximumScale: 2,
	userScalable: true,
	viewportFit: "cover",
}

export function generateStaticParams() {
	return LOCALES.map((lang) => ({ lang }))
}

export default async function RootLayout({
	children,
	params,
}: Readonly<{
	children: React.ReactNode
	params: Promise<{ lang: string }>
}>) {
	const { lang } = await params
	if (!isLocale(lang)) notFound()
	const messages = await getMessages(lang)

	return (
		<html
			lang={lang}
			className={`${barlowCondensed.variable} ${syne.variable}`}
		>
			<body>
				<LocaleProvider locale={lang} messages={messages}>
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
					<Footer locale={lang} />
					<SiteAnalytics />
				</LocaleProvider>
			</body>
		</html>
	)
}
