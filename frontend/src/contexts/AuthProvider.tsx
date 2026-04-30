"use client";

import { useEffect } from "react";

import { API_BASE_URL } from "@/app/api/requests";
import { auth } from "@/firebase/firebase";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const unsubscribe = auth.onIdTokenChanged((user) => {
      void (async () => {
        try {
          if (user) {
            const idToken = await user.getIdToken();
            await fetch(`${API_BASE_URL}/sessionLogin`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ idToken }),
            });
          } else {
            await fetch(`${API_BASE_URL}/sessionLogout`, {
              method: "POST",
              credentials: "include",
            });
          }
        } catch {
          // best-effort; route middleware will handle missing sessions
        }
      })();
    });

    return () => unsubscribe();
  }, []);

  return <>{children}</>;
}
