import { PublicClientApplication } from "@azure/msal-browser";

// msal is an object that stores all the microsoft accounts that the application has seen so far
const msal = new PublicClientApplication({
  auth: {
    clientId: process.env.NEXT_PUBLIC_MS_CLIENT_ID!,
    authority: "https://login.microsoftonline.com/common",
    redirectUri: process.env.NEXT_PUBLIC_MS_REDIRECT_URI!,
  },
});

// Ask for permission to read user profile info and send email
const request = {
  scopes: ["User.Read", "Mail.Send"],
};

// Initialize MSAL and determine the active account from redirect or cache
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

// Here the application redirect the user to microsoft to make them log in. Microsoft will authorize the user
// and will look at the tenant's redirect URL to see what webpage of the application to send the user back
export async function signInWithOutlook() {
  await msal.loginRedirect(request);
}

// Gets a Microsoft Graph access token for the requested scopes (e.g., User.Read, Mail.Send)
// so we can call Graph APIs on behalf of the signed-in user.
export async function getGraphToken() {
  const account = msal.getActiveAccount() ?? msal.getAllAccounts()[0];
  if (!account) throw new Error("Not signed in");

  const res = await msal.acquireTokenSilent({
    ...request,
    account: account,
  });

  return res.accessToken;
}
