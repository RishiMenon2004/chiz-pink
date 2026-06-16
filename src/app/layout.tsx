import type { Metadata } from "next";
import { Barlow_Condensed, Ephesis } from "next/font/google";
import "./globals.css";
import styles from "./page.module.css";
import NavButton from "@/components/NavButton";
import CurrencyBar from "@/components/CurrencyBar";

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
    <html lang="en" className={`${barlowCondensed.variable} ${ephesis.variable}`}>
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
      <nav>
        <NavButton href="" icon="home.png"/>
        <NavButton href="checklist" icon="checklist.png"/>
        <NavButton href="characters" icon="characters.png"/>
        <NavButton href="inventory" icon="inventory.png"/>
      </nav>

      <svg xmlns='http://www.w3.org/2000/svg' className="fender">
        <path d='M68.1396 0C71.3754 0 74.293 1.94905 75.5312 4.93848L88.7852 36.9385C90.9669 42.2059 87.0959 47.9999 81.3945 48H0V0H68.1396Z'/>
      </svg>

      <NavButton href="settings" icon="settings.png" className="settings-btn"/>
    </div>
  );
}
