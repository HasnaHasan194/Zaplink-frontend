const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, body: unknown) {
    super(`Request failed with status ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

function getToken(): string | null {
  return localStorage.getItem('access_token');
}

const USER_KEY = 'auth_user';

export function setToken(token: string | null) {
  if (token) {
    localStorage.setItem('access_token', token);
  } else {
    localStorage.removeItem('access_token');
  }
}

export function setStoredUser(user: { id: string; email: string } | null) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

export function loadStoredSession(): {
  token: string | null;
  user: { id: string; email: string } | null;
} {
  const token = localStorage.getItem('access_token');
  const raw = localStorage.getItem(USER_KEY);
  if (!token || !raw) {
    return { token, user: null };
  }
  try {
    const user = JSON.parse(raw) as { id: string; email: string };
    if (user?.id && user?.email) {
      return { token, user };
    }
  } catch {
    /* ignore */
  }
  return { token, user: null };
}

export async function apiJson<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }
  const token = getToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  const res = await fetch(`${baseUrl}${path}`, { ...init, headers });
  const text = await res.text();
  let data: unknown;
  if (text) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      data = { message: text };
    }
  }
  if (!res.ok) {
    throw new ApiError(res.status, data);
  }
  return data as T;
}

export function formatApiMessage(err: unknown): string {
  if (err instanceof ApiError) {
    const b = err.body as
      | { message?: string | string[] }
      | undefined;
    if (Array.isArray(b?.message)) {
      return b.message.join(', ');
    }
    if (typeof b?.message === 'string') {
      return b.message;
    }
  }
  if (err instanceof Error) {
    return err.message;
  }
  return 'Something went wrong';
}
