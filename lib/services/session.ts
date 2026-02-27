import api from '@/lib/api';

export interface SessionUser {
  id: string;
  email: string;
  profile?: { displayName: string | null; avatarUrl?: string | null } | null;
}

export interface SessionRating {
  id: string;
  sessionId: string;
  raterId: string;
  ratedId: string;
  stars: number;
  createdAt: string;
  rater?: SessionUser;
  rated?: SessionUser;
}

export interface Session {
  id: string;
  roomId: string;
  userAId: string;
  userBId: string;
  userA?: SessionUser;
  userB?: SessionUser;
  topic: string | null;
  level: string | null;
  startedAt: string;
  endedAt: string | null;
  durationSeconds: number | null;
  endedById: string | null;
  createdAt: string;
  ratings?: SessionRating[];
}

export const sessionAdminService = {
  async list(params: {
    page?: number;
    limit?: number;
    search?: string;
    level?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<{ sessions: Session[]; total: number; page: number; limit: number }> {
    const { data } = await api.get('/admin/sessions', { params });
    return data.data;
  },

  async get(id: string): Promise<Session & { ratings: SessionRating[] }> {
    const { data } = await api.get(`/admin/sessions/${id}`);
    return data.data;
  },
};
