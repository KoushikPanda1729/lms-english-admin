import api from '@/lib/api';

export const authService = {
  async login(email: string, password: string) {
    const { data } = await api.post('/auth/login', { email, password });
    // Backend sets httpOnly cookies — we just read user info from response body
    return data.data as {
      user: { id: string; email: string; role: string };
    };
  },

  async self() {
    const { data } = await api.get('/auth/self');
    return data.data as { id: string; email: string; role: string };
  },

  async googleSignIn(accessToken: string) {
    const { data } = await api.post('/auth/google', {
      accessToken,
      deviceId: 'web',
      platform: 'web',
    });
    // Backend sets httpOnly cookies — just return user info
    return data.data as {
      user: { id: string; email: string; role: string };
    };
  },

  async logout() {
    try {
      // Backend clears httpOnly cookies via validateRefreshToken middleware
      await api.post('/auth/logout');
    } catch {
      /* ignore — cookies will expire on their own */
    }
  },
};
