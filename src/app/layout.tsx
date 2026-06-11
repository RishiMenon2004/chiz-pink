import type { Metadata } from "next";
import Link from "next/link";
import { Chango, Barlow_Condensed, Ephesis } from "next/font/google";
import "./globals.css";
import styles from "./page.module.css";
import Image from "next/image";

const syne = Chango({
  variable: "--font-title",
  weight: '400',
  subsets: ["latin"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  weight: '500',
  subsets: ['latin']
})

const ephesis = Ephesis({
  variable: "--font-ephesis",
  weight: '400',
  subsets: ['latin']
}) 
/* Keeping for future ref */

export const metadata: Metadata = {
  title: "Chiz.Pink | Dashboard",
  description: "Your favourite daily planner and inventory tracker :3",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${barlowCondensed.variable} ${syne.variable} ${ephesis.variable}`}>
      <body>
        <Sidebar/>
        <CurrencyBar/>
        <div className={styles.page}>
          {children}
        </div>
      </body>
    </html>
  );
}

function Sidebar() {
  return (
    <div className="sidebar">
      <svg xmlns='http://www.w3.org/2000/svg' className="fender"><path d='M68.1396 0C71.3754 0 74.293 1.94905 75.5312 4.93848L88.7852 36.9385C90.9669 42.2059 87.0959 47.9999 81.3945 48H0V0H68.1396Z'/></svg>
      <span className="overflow-wrapper">
        <div className="cursive">Chiz.pink</div>
      </span>
    </div>
  );
}

function CurrencyBar() {

  const localeUS = (x: number) => x.toLocaleString("en-US")

  return (
    <div className="currency-bar">
      <Link href="/" className="nav-btn"><Image className="icon" src="/briefcase-solid.svg" width={512} height={512} alt="inventory icon"/></Link>
      <Link href="/checklist" className="nav-btn"><Image className="icon" src="/briefcase-solid.svg" width={512} height={512} alt="inventory icon"/></Link>
      <Link href="/characters" className="nav-btn"><Image className="icon" src="/briefcase-solid.svg" width={512} height={512} alt="inventory icon"/></Link>
      <Link href="/inventory" className="nav-btn"><Image className="icon" src="/briefcase-solid.svg" width={512} height={512} alt="inventory icon"/></Link>
      <div className="currency-box"><span>{localeUS(1000000)}</span><span className="edit-btn"></span></div>
      <div className="currency-box"><span>{localeUS(1000000)}</span><span className="edit-btn"></span></div>
    </div>
  )
}
