import api from '@/lib/api';

export interface OnboardingQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  levelTag: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreateQuestionPayload {
  question: string;
  options: string[];
  correctIndex: number;
  levelTag: string;
  sortOrder?: number;
}

export interface UpdateQuestionPayload {
  question?: string;
  options?: string[];
  correctIndex?: number;
  levelTag?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export const onboardingService = {
  async list(): Promise<OnboardingQuestion[]> {
    const { data } = await api.get('/admin/onboarding/questions');
    return data.data as OnboardingQuestion[];
  },

  async create(payload: CreateQuestionPayload): Promise<OnboardingQuestion> {
    const { data } = await api.post('/admin/onboarding/questions', payload);
    return data.data as OnboardingQuestion;
  },

  async update(id: string, payload: UpdateQuestionPayload): Promise<OnboardingQuestion> {
    const { data } = await api.patch(`/admin/onboarding/questions/${id}`, payload);
    return data.data as OnboardingQuestion;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/admin/onboarding/questions/${id}`);
  },
};
