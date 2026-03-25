/**
 * Appels aux Route Handlers Next avec le JWT InsForge (après `signInWithPassword`, etc.).
 * Le SDK expose en général `accessToken` dans la réponse ; à stocker côté client
 * (state / mémoire) pour les appels API sensibles.
 */
export async function fetchWithInsforgeToken(path: string, accessToken: string, init?: RequestInit) {
  const url = path.startsWith("http") ? path : path.startsWith("/") ? path : `/${path}`;
  return fetch(url, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    }
  });
}
