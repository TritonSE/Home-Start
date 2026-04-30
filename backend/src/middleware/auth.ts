import { auth } from "../firebase/admin";

import type { NextFunction, Request, Response } from "express";

const SESSION_COOKIE_NAME = "__session";

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

// Extend Express Request to include user info
export type AuthRequest = {
  user?: {
    uid: string;
    email?: string;
  };
} & Request;

export const verifyToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split("Bearer ")[1];

      // Verify token with Firebase Admin
      const decodedToken = await auth.verifyIdToken(token);

      // Attach user info to request
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
      };
      next();
      return;
    }

    // Fallback to server-issued session cookie
    const cookies = parseCookies(req.headers.cookie);
    const sessionCookie = cookies[SESSION_COOKIE_NAME];

    if (!sessionCookie) {
      res.status(401).json({ error: "No token provided" });
      return;
    }

    const decodedToken = await auth.verifySessionCookie(sessionCookie, true);

    req.user = { uid: decodedToken.sub, email: decodedToken.email };
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
