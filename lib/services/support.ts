import api from '../api';

export interface Conversation {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface SupportMsg {
  id: string;
  userId: string;
  fromAdmin: boolean;
  text: string;
  readAt: string | null;
  createdAt: string;
}

export const supportService = {
  async listConversations(): Promise<Conversation[]> {
    const res = await api.get('/admin/support/conversations');
    return res.data.data;
  },

  async getConversation(userId: string): Promise<SupportMsg[]> {
    const res = await api.get(`/admin/support/conversations/${userId}`);
    return res.data.data;
  },

  async getTotalUnread(): Promise<number> {
    const res = await api.get('/admin/support/unread');
    return res.data.data.count;
  },

  async markRead(userId: string): Promise<void> {
    await api.patch(`/admin/support/conversations/${userId}/read`);
  },
};
