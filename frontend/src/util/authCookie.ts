const AUTH_COOKIE_NAME = "firebaseAuthToken";

export function setFirebaseAuthCookie(token: string) {
  document.cookie = `${AUTH_COOKIE_NAME}=${token}; path=/; Secure; SameSite=Strict`;
}

export function clearFirebaseAuthCookie() {
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; Secure; SameSite=Strict; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}
