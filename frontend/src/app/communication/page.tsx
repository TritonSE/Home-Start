"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NewMessagePage from "../messages/new/page";
import { initMsal } from "@/auth/msal";

export default function CommunicationPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const finalizeMicrosoftLogin = async () => {
      const account = await initMsal();

      if (!account) {
        router.replace("/dashboard");
        return;
      }

      if (mounted) {
        setReady(true);
      }
    };

    void finalizeMicrosoftLogin();

    return () => {
      mounted = false;
    };
  }, [router]);

  if (!ready) {
    return null;
  }
  return <NewMessagePage />;
}
