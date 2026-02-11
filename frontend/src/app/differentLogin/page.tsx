"use client";

import { routerServerGlobal } from "next/dist/server/lib/router-utils/router-server-context";
import { signInWithOutlook, initMsal } from "../signing";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OutlookLoginPage() {
  const router = useRouter();

  useEffect(() => {
    const initLogin = async () => {
      const account = await initMsal();
      if (account) router.push("/text");
    };
    initLogin();
  }, [router]);

  return (
    <div>
      <h1>Login with Outlook</h1>
      <button onClick={signInWithOutlook}>Sign in with Outlook</button>
    </div>
  );
}
