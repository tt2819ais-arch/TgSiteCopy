import { isTokenExpired } from '@/utils/crypto';

const BASE_URL = '/api';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  skipAuth?: boolean;
}

class ApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private refreshPromise: Promise<string | null> | null = null;

  setTokens(access: string, refresh: string): void {
    this.accessToken = access;
    this.refreshToken = refresh;
    localStorage.setItem('nyxgram_access_token', access);
    localStorage.setItem('nyxgram_refresh_token', refresh);
  }

  loadTokens(): void {
    this.accessToken = localStorage.getItem('nyxgram_access_token');
    this.refreshToken = localStorage.getItem('nyxgram_refresh_token');
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('nyxgram_access_token');
    localStorage.removeItem('nyxgram_refresh_token');
  }

  isAuthenticated(): boolean {
    return !!this.accessToken && !isTokenExpired(this.accessToken);
  }

  private async getValidToken(): Promise<string | null> {
    if (!this.accessToken) return null;

    if (!isTokenExpired(this.accessToken)) {
      return this.accessToken;
    }

    if (!this.refreshToken) {
      this.clearTokens();
      return null;
    }

    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.doRefresh();
    const token = await this.refreshPromise;
    this.refreshPromise = null;
    return token;
  }

  private async doRefresh(): Promise<string | null> {
    try {
      const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (!res.ok) {
        this.clearTokens();
        window.dispatchEvent(new CustomEvent('auth:logout'));
        return null;
      }

      const data = await res.json();
      this.setTokens(data.data.accessToken, data.data.refreshToken);
      return this.accessToken;
    } catch {
      this.clearTokens();
      window.dispatchEvent(new CustomEvent('auth:logout'));
      return null;
    }
  }

  private buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
    const url = new URL(`${BASE_URL}${path}`, window.location.origin);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      });
    }

    return url.toString();
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { params, skipAuth, ...fetchOptions } = options;

    const headers = new Headers(fetchOptions.headers);

    if (!skipAuth) {
      const token = await this.getValidToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    if (!(fetchOptions.body instanceof FormData)) {
      if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }
    }

    const url = this.buildUrl(path, params);

    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    if (response.status === 401 && !skipAuth) {
      this.clearTokens();
      window.dispatchEvent(new CustomEvent('auth:logout'));
      throw new ApiError('Сессия истекла', 401);
    }

    const contentType = response.headers.get('content-type');
    let data: unknown;

    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorData = data as Record<string, unknown>;
      const message = (errorData?.message as string) || (errorData?.error as string) || 'Произошла ошибка';
      throw new ApiError(message, response.status, errorData);
    }

    return data as T;
  }

  async get<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    return this.request<T>(path, { method: 'GET', params });
  }

  async post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options,
    });
  }

  async put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  async patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  async delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'DELETE' });
  }

  async upload<T>(path: string, formData: FormData): Promise<T> {
    return this.request<T>(path, {
      method: 'POST',
      body: formData,
    });
  }
}

export class ApiError extends Error {
  status: number;
  data?: Record<string, unknown>;

  constructor(message: string, status: number, data?: Record<string, unknown>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const api = new ApiClient();
export default api;
