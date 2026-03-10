import { PublicClientApplication } from "@azure/msal-browser";

const msal = new PublicClientApplication({
  auth: {
    clientId: process.env.NEXT_PUBLIC_MS_CLIENT_ID!,
    authority: "https://login.microsoftonline.com/common",
    redirectUri: process.env.NEXT_PUBLIC_MS_REDIRECT_URI!,
  },
});

const request = {
  scopes: ["User.Read", "Mail.Send"],
};

export async function initMsal() {
  await msal.initialize();
  const result = await msal.handleRedirectPromise().catch((e) => {
    console.error("MSAL Redirect Error:", e);
  });
  if (result?.account) {
    msal.setActiveAccount(result.account);
    return result.account;
  } else {
    const accounts = msal.getAllAccounts();
    if (accounts.length) {
      msal.setActiveAccount(accounts[0]);
      return accounts[0];
    }
  }
}

export async function signInWithOutlook() {
  console.log("Initiating Microsoft login");
  await msal.loginRedirect(request);
}

export async function getGraphToken() {
  const account = msal.getActiveAccount() ?? msal.getAllAccounts()[0];
  if (!account) throw new Error("Not signed in");

  const res = await msal.acquireTokenSilent({
    ...request,
    account: account,
  });

  return res.accessToken;
}
