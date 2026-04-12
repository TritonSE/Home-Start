"use client";

import { useEffect, useState } from "react";
import NewMessagePage from "../messages/new/page";
import { useTextingFlowStore } from "../messages/new/_store/textingFlowStore";
import { initMsal } from "@/auth/msal";

export default function CommunicationPage() {
  const [emailReady, setEmailReady] = useState(false);
  const mode = useTextingFlowStore((s) => s.mode);

  useEffect(() => {
    if (mode !== "email") {
      return;
    }

    let mounted = true;

    const finalizeMicrosoftLogin = async () => {
      await initMsal();

      if (mounted) {
        setEmailReady(true);
      }
    };

    void finalizeMicrosoftLogin();

    return () => {
      mounted = false;
    };
  }, [mode]);

  if (mode !== "email") {
    return <NewMessagePage />;
  }

  if (!emailReady) {
    return null;
  }

  return <NewMessagePage />;
}
