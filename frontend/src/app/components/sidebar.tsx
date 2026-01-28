"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Open_Sans } from "next/font/google";
import styles from "./sidebar.module.css";

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const NAV = [
  { label: "Dashboard", href: "/dashboard", icon: "/ic_dashboard.svg" },
  { label: "Communication", href: "/communication", icon: "/ic_communication.svg" },
  { label: "Volunteers", href: "/volunteers", icon: "/ic_volunteers.svg" },
] as const;

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={`${styles.sidebar} ${openSans.className}`}>
      <div className={styles.logoWrap}>
        <img src="/Main Vertical USE 1.svg" alt="Home Start" className={styles.logo} />
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
              <img src={item.icon} alt="" className={styles.icon} aria-hidden="true" />
              <span className={styles.label}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
