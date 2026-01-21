import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "../components/sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Home Start",
  description: "Home Start dashboard",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
        style={{ margin: 0, height: "100vh", overflow: "hidden" }}
      >
        <div style={{ display: "flex", height: "100vh" }}>
          <Sidebar />

          <main
            style={{
              flex: 1,
              background: "#fff",
              height: "100vh",
              overflowY: "auto",
              overflowX: "hidden",
            }}
          >
            <div
              style={{
                maxWidth: "1320px",
                margin: "0 auto",
                padding: "28px 32px",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
