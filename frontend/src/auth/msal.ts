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

let initialized = false;

export async function initMsal() {
  if (!initialized) {
    await msal.initialize();

    let account;

    try {
      const result = await msal.handleRedirectPromise({
        navigateToLoginRequestUrl: false,
      });
      account = result?.account;
    } catch (e) {
      console.error("MSAL Redirect Error:", e);
    }

    if (!account) {
      const accounts = msal.getAllAccounts();
      account = accounts[0];
    }

    if (account) {
      msal.setActiveAccount(account);
    }

    initialized = true;
    return account;
  }

  const activeAccount = msal.getActiveAccount();
  if (activeAccount) return activeAccount;

  const accounts = msal.getAllAccounts();
  if (accounts.length) {
    msal.setActiveAccount(accounts[0]);
    return accounts[0];
  }

  return undefined;
}

export async function signInWithOutlook() {
  await initMsal();
  await msal.loginRedirect(request);
}

export async function getGraphToken() {
  const account = msal.getActiveAccount() ?? msal.getAllAccounts()[0];
  if (!account) throw new Error("Not signed in");

  const res = await msal.acquireTokenSilent({
    ...request,
    account,
  });

  return res.accessToken;
}
