"use client";

import { useEffect, useState } from "react";

import { useTextingFlowStore } from "../messages/new/_store/textingFlowStore";
import NewMessagePage from "../messages/new/page";

import { initMsal, signInWithOutlook } from "@/auth/msal";

export async function handleEmailClick() {
  const setMode = useTextingFlowStore.getState().setMode;
  const account = await initMsal();
  if (account) {
    setMode("email");
  } else {
    sessionStorage.setItem("pendingMode", "email");
    await signInWithOutlook();
  }
}

export default function CommunicationPage() {
  const [emailReady, setEmailReady] = useState(false);
  const mode = useTextingFlowStore((s) => s.mode);
  const setMode = useTextingFlowStore((s) => s.setMode);
  useEffect(() => {
    let mounted = true;

    const finalizeMicrosoftLogin = async () => {
      const account = await initMsal();

      if (mounted) {
        const pendingMode = sessionStorage.getItem("pendingMode");
        if (account && pendingMode === "email") {
          setMode("email");
          sessionStorage.removeItem("pendingMode");
        }
        setEmailReady(true);
      }
    };

    void finalizeMicrosoftLogin();

    return () => {
      mounted = false;
    };
  }, [mode]);

  const pendingMode = sessionStorage.getItem("pendingMode");

  if (mode === "text" && !pendingMode) {
    return <NewMessagePage />;
  }

  if (!emailReady) {
    return null;
  }

  return <NewMessagePage />;
}
