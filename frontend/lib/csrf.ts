const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

let csrfToken: string | null = null;
let csrfPromise: Promise<string> | null = null;

export async function ensureCsrfToken(): Promise<string> {
  if (csrfToken) {
    return csrfToken;
  }

  if (!csrfPromise) {
    csrfPromise = fetch(`${API_BASE}/auth/csrf`, { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch CSRF token');
        }
        const data = (await res.json()) as { csrfToken?: string };
        if (!data.csrfToken) {
          throw new Error('Invalid CSRF response');
        }
        return data.csrfToken;
      })
      .then((token) => {
        csrfToken = token;
        return token;
      })
      .catch((err) => {
        csrfPromise = null;
        throw err;
      });
  }

  return csrfPromise;
}

export function clearCsrfToken(): void {
  csrfToken = null;
  csrfPromise = null;
}
