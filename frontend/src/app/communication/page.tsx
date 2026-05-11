"use client";

import { useEffect, useState } from "react";

import { useTextingFlowStore } from "../messages/new/_store/textingFlowStore";
import NewMessagePage from "../messages/new/page";

import { initMsal } from "@/auth/msal";

export default function CommunicationPage() {
  const [emailReady, setEmailReady] = useState(false);
  const mode = useTextingFlowStore((s) => s.mode);
  console.log("the mode is", mode);
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
