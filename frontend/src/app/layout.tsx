import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Sidebar from "./components/sidebar";
import styles from "./layout.module.css";
import { Open_Sans, Viga } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-open-sans",
});

const viga = Viga({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-viga",
});

export const metadata: Metadata = {
  title: "Home Start",
  description: "Home Start dashboard",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${openSans.variable} ${viga.variable} ${styles.body}`}
      >
        <div className={styles.layout}>
          <Sidebar />
          <main className={styles.main}>
            <div className={styles.contentArea}>{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
