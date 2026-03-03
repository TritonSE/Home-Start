"use client";

import { useEffect } from "react";
import { auth } from "@/firebase/firebase";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const unsubscribe = auth.onIdTokenChanged(async (user) => {
      if (user) {
        const token = await user.getIdToken();
        document.cookie = `firebaseAuthToken=${token}; path=/`;
      } else {
        document.cookie = `firebaseAuthToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      }
    });

    return () => unsubscribe();
  }, []);

  return <>{children}</>;
}
