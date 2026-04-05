"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Open_Sans } from "next/font/google";
import styles from "./sidebar.module.css";
import layoutStyles from "../app/layout.module.css";
import Image from "next/image";

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const NAV = [
  { label: "Dashboard", href: "/dashboard", icon: "/ic_dashboard.svg" },
  { label: "Communication", href: "/communication", icon: "/ic_communication.svg" },
  { label: "Volunteers", href: "/volunteers", icon: "/ic_volunteers.svg" },
] as const;

export default function Sidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className={layoutStyles.layout}>
      <aside className={`${styles.sidebar} ${openSans.className}`}>
        <div className={styles.logoWrap}>
          <Image
            src="/Main Vertical USE 1.svg"
            alt="Home Start"
            className={styles.logo}
            width={100}
            height={100}
          />
        </div>

        <nav className={styles.nav}>
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");

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
