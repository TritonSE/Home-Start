"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/contexts/AuthProvider";

export default function AuthGate({ children }: { children: React.ReactNode }): React.ReactNode {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (pathname === "/") {
      void router.replace(user ? "/dashboard" : "/login");
      return;
    }

    if (pathname === "/login") {
      if (user) {
        void router.replace("/dashboard");
      }
      return;
    }

    if (!user) {
      void router.replace("/login");
    }
  }, [loading, pathname, router, user]);

  if (loading) {
    return null;
  }

  if (pathname === "/") {
    return null;
  }

  if (pathname === "/login") {
    return user ? null : children;
  }

  return user ? children : null;
}
