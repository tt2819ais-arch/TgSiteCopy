import api from './api';
import type { ApiResponse } from '@/types/common';
import type { User, LoginCredentials, RegisterCredentials, AuthTokens } from '@/types/user';

interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

interface CheckUsernameResponse {
  available: boolean;
  message: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials, {
      skipAuth: true,
    });
    if (res.data) {
      api.setTokens(res.data.tokens.accessToken, res.data.tokens.refreshToken);
    }
    return res.data;
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/register', credentials, {
      skipAuth: true,
    });
    if (res.data) {
      api.setTokens(res.data.tokens.accessToken, res.data.tokens.refreshToken);
    }
    return res.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      api.clearTokens();
    }
  },

  async getMe(): Promise<User> {
    const res = await api.get<ApiResponse<User>>('/auth/me');
    return res.data;
  },

  async checkUsername(username: string): Promise<CheckUsernameResponse> {
    const res = await api.get<ApiResponse<CheckUsernameResponse>>('/auth/check-username', {
      username,
    });
    return res.data;
  },

  async refreshTokens(): Promise<AuthTokens> {
    const refreshToken = localStorage.getItem('nyxgram_refresh_token');
    const res = await api.post<ApiResponse<AuthTokens>>(
      '/auth/refresh',
      { refreshToken },
      { skipAuth: true }
    );
    if (res.data) {
      api.setTokens(res.data.accessToken, res.data.refreshToken);
    }
    return res.data;
  },
};

export default authService;
