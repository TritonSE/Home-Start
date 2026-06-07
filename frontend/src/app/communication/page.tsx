"use client";

import { useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  const requestedMode = searchParams.get("mode");
  const [emailReady, setEmailReady] = useState(false);
  const mode = useTextingFlowStore((s) => s.mode);
  const setMode = useTextingFlowStore((s) => s.setMode);

  useEffect(() => {
    let mounted = true;
    const wantsEmail =
      requestedMode === "email" || sessionStorage.getItem("pendingMode") === "email";

    const finalizeMicrosoftLogin = async () => {
      const account = await initMsal();

      if (!mounted) return;

      if (wantsEmail && account) {
        setMode("email");
        sessionStorage.removeItem("pendingMode");
        setEmailReady(true);
        return;
      }

      if (wantsEmail && !account) {
        sessionStorage.setItem("pendingMode", "email");
        await signInWithOutlook();
        return;
      }

      if (mounted) {
        setEmailReady(true);
      }
    };

    void finalizeMicrosoftLogin();

    return () => {
      mounted = false;
    };
  }, [requestedMode, setMode]);

  const pendingMode = sessionStorage.getItem("pendingMode");

  if (mode === "text" && !pendingMode && requestedMode !== "email") {
    return <NewMessagePage />;
  }

  if (!emailReady) {
    return null;
  }

  return <NewMessagePage />;
}
