import api from '@/lib/api';

export const notificationService = {
  async send(payload: { target: 'all' | 'user'; userIds?: string[]; title: string; body: string }) {
    const { data } = await api.post('/admin/notifications', payload);
    return data.data as { sent: number };
  },
};
