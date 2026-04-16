"use client";

import { Open_Sans } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import layoutStyles from "../app/layout.module.css";
import { useTextingFlowStore } from "../app/messages/new/_store/textingFlowStore";

import styles from "./Sidebar.module.css";

import communicationIcon from "@/assets/ic_communication.svg";
import dashboardIcon from "@/assets/ic_dashboard.svg";
import volunteersIcon from "@/assets/ic_volunteers_2.svg";
import homeStartLogo from "@/assets/Main Vertical USE 1.svg";

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const NAV = [
  { label: "Dashboard", href: "/dashboard", icon: dashboardIcon },
  { label: "Communication", href: "/communication", icon: communicationIcon },
  { label: "Volunteers", href: "/volunteers", icon: volunteersIcon },
] as const;

export default function Sidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const setMode = useTextingFlowStore((s) => s.setMode);

  const handleCommunicationClick = () => {
    setMode("text");
    router.push("/communication");
  };

  return (
    <div className={layoutStyles.layout}>
      <aside className={`${styles.sidebar} ${openSans.className}`}>
        <div className={styles.logoWrap}>
          <Image
            src={homeStartLogo}
            alt="Home Start"
            className={styles.logo}
            width={115}
            height={140}
            priority
          />
        </div>

        <nav className={styles.nav}>
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={item.href === "/communication" ? handleCommunicationClick : undefined}
                className={`${styles.item} ${active ? styles.active : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <Image src={item.icon} alt="" className={styles.icon} aria-hidden="true" />
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
