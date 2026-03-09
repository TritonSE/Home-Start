import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat, Viga, Open_Sans } from "next/font/google";
import "./globals.css";
import styles from "./layout.module.css";
import AuthProvider from "../contexts/AuthProvider";

const montserrat = Montserrat({
  variable: "--font-title-bold",
  subsets: ["latin"],
  weight: ["800", "900"],
});

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
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
