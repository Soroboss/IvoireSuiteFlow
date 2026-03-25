const STORAGE_KEY = "isf_insforge_access_token";

/** Stocke le JWT pour les appels `Authorization: Bearer` vers nos Route Handlers. */
export function setAccessToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) {
    sessionStorage.setItem(STORAGE_KEY, token);
  } else {
    sessionStorage.removeItem(STORAGE_KEY);
  }
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(STORAGE_KEY);
}

export function clearSession() {
  setAccessToken(null);
}
