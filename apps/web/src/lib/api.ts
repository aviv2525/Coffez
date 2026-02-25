const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export type ApiResponse<T> = T;

async function getAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  // Access token is kept in memory or short-lived; we use refresh to get new one
  const t = (window as any).__orderbridge_access_token as string | undefined;
  if (t) return t;
  return null;
}

async function setAccessToken(token: string) {
  if (typeof window !== 'undefined') (window as any).__orderbridge_access_token = token;
}

async function refreshAccessToken(): Promise<string | null> {
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (data.accessToken) {
    await setAccessToken(data.accessToken);
    return data.accessToken;
  }
  return null;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ data?: T; error?: string; status: number }> {
  const token = await getAccessToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;

  console.log('API URL =>', `${API_BASE}${path}`);
  
  const url = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
  let res = await fetch(url, { ...options, credentials: 'include', headers });
  
  console.log('API URL =>', `${API_BASE}${path}`);
  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`;
      res = await fetch(`${API_BASE}${path}`, { ...options, credentials: 'include', headers });
    }
  }

  const status = res.status;
  const text = await res.text();
  let data: T | undefined;
  try {
    data = text ? JSON.parse(text) : undefined;
  } catch {
    return { error: text || 'Request failed', status };
  }

  if (!res.ok) {
    return {
      error: (data as any)?.message || (data as any)?.error || res.statusText,
      status,
    };
  }
  return { data: data as T, status };
}

export function setAuthToken(token: string) {
  setAccessToken(token);
}

export function clearAuthToken() {
  if (typeof window !== 'undefined') (window as any).__orderbridge_access_token = undefined;
}
