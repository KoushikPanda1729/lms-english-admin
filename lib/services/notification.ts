import api from '@/lib/api';

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
