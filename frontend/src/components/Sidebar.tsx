"use client";

import { Open_Sans } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import styles from "./Sidebar.module.css";

import layoutStyles from "@/app/layout.module.css";
import icCommunicationAsset from "@/assets/ic_communication.svg";
import icDashboardAsset from "@/assets/ic_dashboard.svg";
import icVolunteersAsset from "@/assets/ic_volunteers.svg";
import mainVerticalAsset from "@/assets/Main Vertical USE 1.svg";

const icDashboard = icDashboardAsset as string;
const icCommunication = icCommunicationAsset as string;
const mainVertical = mainVerticalAsset as string;
const icVolunteers = icVolunteersAsset as string;

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const NAV = [
  { label: "Dashboard", href: "/dashboard", icon: icDashboard },
  { label: "Communication", href: "/communication", icon: icCommunication },
  { label: "Volunteers", href: "/volunteers", icon: icVolunteers },
] as const;

export default function Sidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className={layoutStyles.layout}>
      <aside className={`${styles.sidebar} ${openSans.className}`}>
        <div className={styles.logoWrap}>
          <Image
            src={mainVertical}
            alt="Home Start"
            className={styles.logo}
            width={100}
            height={100}
            loading="eager"
          />
        </div>

        <nav className={styles.nav}>
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.item} ${active ? styles.active : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <Image
                  src={item.icon}
                  alt=""
                  className={styles.icon}
                  aria-hidden="true"
                  width={24}
                  height={24}
                />
                <span className={styles.label}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className={layoutStyles.main}>
        <div className={layoutStyles.contentArea}>{children}</div>
      </main>
    </div>
  );
}
