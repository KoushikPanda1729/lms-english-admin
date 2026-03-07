import api from '@/lib/api';

export interface AIPersona {
  id: string;
  name: string;
  avatar: string;
  expertise: string;
  description: string;
  systemPrompt: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isPremium: boolean;
  isActive: boolean;
  sortOrder: number;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AIPersonaStats {
  totalSessions: number;
  totalPersonas: number;
  activePersonas: number;
  topPersonas: { personaName: string; count: number }[];
}

export const aiPersonaService = {
  async listPersonas(params: {
    page?: number;
    limit?: number;
    isActive?: boolean;
    difficulty?: string;
    isPremium?: boolean;
  }) {
    const { data } = await api.get('/admin/ai-personas', { params });
    return data.data as {
      personas: AIPersona[];
      total: number;
      page: number;
      limit: number;
    };
  },

  async getStats() {
    const { data } = await api.get('/admin/ai-personas/stats');
    return data.data as AIPersonaStats;
  },

  async seedPersonas() {
    const { data } = await api.post('/admin/ai-personas/seed');
    return data.data as { created: number; skipped: number };
  },

  async createPersona(body: {
    name: string;
    avatar: string;
    expertise: string;
    description: string;
    systemPrompt: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    isPremium: boolean;
    sortOrder: number;
  }) {
    const { data } = await api.post('/admin/ai-personas', body);
    return data.data as AIPersona;
  },

  async updatePersona(
    id: string,
    body: Partial<{
      name: string;
      avatar: string;
      expertise: string;
      description: string;
      systemPrompt: string;
      difficulty: 'beginner' | 'intermediate' | 'advanced';
      isPremium: boolean;
      isActive: boolean;
      sortOrder: number;
    }>,
  ) {
    const { data } = await api.patch(`/admin/ai-personas/${id}`, body);
    return data.data as AIPersona;
  },

  async deletePersona(id: string) {
    await api.delete(`/admin/ai-personas/${id}`);
  },

  async uploadAvatar(id: string, file: File) {
    const formData = new FormData();
    formData.append('avatar', file);
    const { data } = await api.post(`/admin/ai-personas/${id}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data as AIPersona;
  },
};
