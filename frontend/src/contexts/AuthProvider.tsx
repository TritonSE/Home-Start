"use client";

import { useEffect } from "react";

import { auth } from "@/firebase/firebase";
import { clearFirebaseAuthCookie, setFirebaseAuthCookie } from "@/util/authCookie";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const unsubscribe = auth.onIdTokenChanged((user) => {
      void (async () => {
        try {
          if (user) {
            const token = await user.getIdToken();
            setFirebaseAuthCookie(token);
          } else {
            clearFirebaseAuthCookie();
          }
        } catch {
          clearFirebaseAuthCookie();
        }
      })();
    });

    return () => unsubscribe();
  }, []);

  return <>{children}</>;
}
