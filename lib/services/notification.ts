import api from '@/lib/api';

export interface AdminActivity {
  id: string;
  type: 'user_registered' | 'course_purchased';
  title: string;
  body: string;
  data: Record<string, string> | null;
  seen: boolean;
  createdAt: string;
  timeAgo: string;
  displayTime: string;
}

export const adminActivityService = {
  async getRecent(): Promise<{ activities: AdminActivity[]; unseenCount: number }> {
    const { data } = await api.get('/admin/activity');
    return data.data;
  },

  async markSeen(id: string): Promise<void> {
    await api.patch(`/admin/activity/${id}/seen`);
  },

  async markAllSeen(): Promise<void> {
    await api.patch('/admin/activity/seen');
  },
};

export interface BroadcastRecord {
  title: string;
  body: string;
  sentAt: string;
  recipientCount: number;
}

export const notificationService = {
  async send(payload: { target: 'all' | 'user'; userIds?: string[]; title: string; body: string }) {
    const { data } = await api.post('/admin/notifications', payload);
    return data.data as { sent: number };
  },

  async getHistory(params: { page?: number; limit?: number } = {}) {
    const { data } = await api.get('/admin/notifications', { params });
    return data.data as {
      broadcasts: BroadcastRecord[];
      total: number;
      page: number;
      limit: number;
    };
  },

  async deleteBroadcast(payload: { title: string; body: string; sentAt: string }) {
    await api.delete('/admin/notifications', { data: payload });
  },
};
