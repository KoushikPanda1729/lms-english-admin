import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // send httpOnly cookies on every request
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: () => void; reject: (e: unknown) => void }> = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve()));
  failedQueue = [];
};

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;

    // Only skip the refresh endpoint itself (prevents infinite loop).
    // /auth/login has no session yet. Everything else — including /auth/self —
    // should attempt a silent refresh when a 401 is received.
    if (original?.url?.includes('/auth/refresh') || original?.url?.includes('/auth/login')) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve: () => resolve(api(original)), reject });
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        // refreshToken is in httpOnly cookie — no body needed
        await api.post('/auth/refresh');
        processQueue(null);
        return api(original);
      } catch (err) {
        processQueue(err);
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          const redirect = encodeURIComponent(window.location.pathname);
          window.location.href = `/login?redirect=${redirect}`;
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
