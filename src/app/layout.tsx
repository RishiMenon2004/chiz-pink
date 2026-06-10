import type { Metadata } from "next";
import Link from "next/link";
// import { Geist } from "next/font/google";
import "./globals.css";
import styles from "./page.module.css";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });
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
    <html lang="en" className={''}>
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
      <h2>Chiz.pink</h2>
      <nav>
        <Link href="/">Home</Link>
        <Link href="/checklist">Checklist</Link>
        <Link href="/characters">Characters</Link>
        <Link href="/inventory">Inventory</Link>
      </nav>
    </div>
  );
}

function CurrencyBar() {
  return (
    <div className="currency-bar">
      <Link href="/inventory" className="nav-btn">I</Link>
      <div className="currency-box">Beetle <span>10000000</span><span className="edit-btn"></span></div>
      <div className="currency-box">Fons <span>10000000</span><span className="edit-btn"></span></div>
    </div>
  )
}
