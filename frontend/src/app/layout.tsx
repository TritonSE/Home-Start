import { Geist, Geist_Mono, Open_Sans, Viga } from "next/font/google";

import styles from "./layout.module.css";

import type { Metadata } from "next";

import "./globals.css";

import AuthGate from "@/components/AuthGate";
import AuthProvider from "@/contexts/AuthProvider";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.cdnfonts.com/css/uber-move-text" rel="stylesheet"></link>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${openSans.variable} ${viga.variable} ${styles.body}`}
      >
        <AuthProvider>
          <AuthGate>{children}</AuthGate>
        </AuthProvider>
      </body>
    </html>
  );
}
