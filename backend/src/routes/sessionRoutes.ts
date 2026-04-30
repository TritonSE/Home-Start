import express from "express";

import { auth } from "../firebase/admin";

import type { RequestHandler } from "express";

const SESSION_COOKIE_NAME = "__session";
const SESSION_EXPIRES_IN_MS = 1000 * 60 * 60 * 24 * 5; // 5 days

const parseCookies = (cookieHeader: string | undefined): Record<string, string> => {
  if (!cookieHeader) return {};

  return cookieHeader.split(";").reduce<Record<string, string>>((acc, part) => {
    const index = part.indexOf("=");
    if (index === -1) return acc;
    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (!key) return acc;
    acc[key] = decodeURIComponent(value);
    return acc;
  }, {});
};

const setSessionCookie = (
  res: Parameters<RequestHandler>[1],
  cookieValue: string,
  maxAgeMs: number,
) => {
  const maxAgeSeconds = Math.floor(maxAgeMs / 1000);

  // Firebase Hosting only forwards the "__session" cookie to backends.
  // Using it here also keeps behavior consistent across environments.
  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(cookieValue)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAgeSeconds}`,
  );
};

const clearSessionCookie = (res: Parameters<RequestHandler>[1]) => {
  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`,
  );
};

const sessionLogin: RequestHandler = async (req, res) => {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const idToken = body.idToken;

  if (typeof idToken !== "string" || !idToken) {
    res.status(400).json({ error: "Missing idToken" });
    return;
  }

  // Verify ID token and mint a session cookie
  const decoded = await auth.verifyIdToken(idToken);
  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: SESSION_EXPIRES_IN_MS,
  });

  setSessionCookie(res, sessionCookie, SESSION_EXPIRES_IN_MS);
  res.status(200).json({ uid: decoded.uid });
};

const sessionLogout: RequestHandler = async (req, res) => {
  try {
    const cookies = parseCookies(req.headers.cookie);
    const sessionCookie = cookies[SESSION_COOKIE_NAME];

    if (sessionCookie) {
      const decoded = await auth.verifySessionCookie(sessionCookie, true);
      await auth.revokeRefreshTokens(decoded.sub);
    }
  } catch {
    // best-effort logout
  }

  clearSessionCookie(res);
  res.status(200).json({ success: true });
};

const router = express.Router();

router.post("/sessionLogin", sessionLogin);
router.post("/sessionLogout", sessionLogout);

export default router;
