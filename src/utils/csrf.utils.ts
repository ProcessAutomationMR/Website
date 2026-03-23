const CSRF_TOKEN_TTL = 30 * 60 * 1000;

interface CSRFTokenData {
  token: string;
  createdAt: number;
}

let inMemoryToken: CSRFTokenData | null = null;

export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const token = Array.from(array, b => b.toString(16).padStart(2, '0')).join('');

  inMemoryToken = {
    token,
    createdAt: Date.now(),
  };

  return token;
}

export function getCSRFToken(): string {
  if (!inMemoryToken) {
    return generateCSRFToken();
  }

  if (Date.now() - inMemoryToken.createdAt > CSRF_TOKEN_TTL) {
    return generateCSRFToken();
  }

  return inMemoryToken.token;
}

export function clearCSRFToken(): void {
  inMemoryToken = null;
}
